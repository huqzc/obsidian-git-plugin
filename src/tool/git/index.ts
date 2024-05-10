import { FileGroup, GitFile, GitState } from './types'
import { CleanOptions, simpleGit, SimpleGit } from 'simple-git'
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
export const gitDir: string = scanGitDirs().pop()

const git: SimpleGit = simpleGit(gitDir)

export async function listGitFiles(): Promise<FileGroup> {
  const status = await git.status()
  const changed: GitFile[] = []
  const untracked: GitFile[] = []

  classifyFile(changed, status.created, 'added')
  classifyFile(changed, status.modified, 'modified')
  classifyFile(changed, status.deleted, 'deleted')
  classifyFile(untracked, status.not_added, 'untracked')

  return { changed, untracked }
}

function classifyFile(sourceList: GitFile[], fileList: string[], status: GitState) {
  for (const filename of fileList) {
    const pathArray = filename.split(GIT_PATH_SEP)
    let fullpath = ''
    let parentNode: GitFile | null = null
    for (let i = 0; i < pathArray.length; i++) {
      const p = pathArray[i]
      if (p === '') {
        // TODO p 为空，说明以目录结束，需要手动遍历该目录获取子目录及文件
        continue
      }

      fullpath += (i === 0 ? '' : GIT_PATH_SEP) + p

      const item: GitFile = {
        name: pathArray[i],
        path: fullpath,
        type: i !== pathArray.length - 1 ? 'dir' : 'file'
      }
      if (item.type === 'file') {
        item.status = status
      }

      if (i === 0) {
        parentNode = findOrCreateNode(sourceList, fullpath, item)
      } else {
        parentNode!.children = parentNode!.children || []
        parentNode = findOrCreateNode(parentNode!.children, fullpath, item)
      }
    }
  }
}

function findOrCreateNode(list: GitFile[], key: string, item: GitFile): GitFile {
  let node = list.find(item => item.key === key)
  if (!node) {
    node = { key, ...item }
    list.push(node)
  }
  return node
}
