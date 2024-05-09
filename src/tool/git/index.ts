import { FileGroup, FileStates, GitFile, GitState } from './types'
import git from 'isomorphic-git'
import * as fs from 'fs'
import * as path from 'path'

function scanGitDirs(dir?: string): string[] {
  const gitDirList: string[] = []

  let currentDir: string = dir || __dirname
  do {
    const gitpath = path.join(currentDir, '.git')
    if (fs.existsSync(gitpath)) {
      gitDirList.push(currentDir)
    }
  } while (currentDir !== (currentDir = path.join(currentDir, '..')))
  return gitDirList
}

const GIT_PATH_SEP: string = '/'
export const gitDir: string = scanGitDirs().pop

export async function listGitFiles(): Promise<FileGroup> {
  const status = await git.statusMatrix({
    fs,
    dir: gitDir
  })
  return groupGitFile(status)
}

function groupGitFile(statusList: FileStates[]): FileGroup {
  const changed: GitFile[] = []
  const untracked: GitFile[] = []
  for (const [filename, head, workdir, stage] of statusList) {
    // 跳过未修改文件
    if (head === 1 && workdir === 1) continue
    // 获取文件 git 状态
    let status: GitState = undefined
    if (head === 0) {
      status = stage === 0 ? 'untracked' : 'added'
    }
    if (head === 1) {
      if (workdir === 0) status = 'deleted'
      else if (workdir === 2) status = 'modified'
    }

    // 切换数据
    let source = status === 'untracked' ? untracked : changed

    // 生成树结构
    const pathArray = filename.split(GIT_PATH_SEP)
    let fullpath = ''
    let parentNode: GitFile | null = null
    for (let i = 0; i < pathArray.length; i++) {
      const p = pathArray[i]
      fullpath += GIT_PATH_SEP + p

      const item: GitFile = {
        name: pathArray[i],
        path: fullpath,
        type: i !== pathArray.length - 1 ? 'dir' : 'file'
      }
      if (i === pathArray.length - 1) {
        item.status = status
      }

      if (i === 0) {
        parentNode = findOrCreateNode(source, fullpath, item)
      } else {
        parentNode!.children = parentNode!.children || []
        parentNode = findOrCreateNode(parentNode!.children, fullpath, item)
      }
    }
  }
  return { changed, untracked }
}

function findOrCreateNode(list: GitFile[], key: string, item: GitFile): GitFile {
  let node = list.find(item => item.key === key)
  if (!node) {
    node = { key, ...item }
    list.push(node)
  }
  return node
}

git.commit({

})
