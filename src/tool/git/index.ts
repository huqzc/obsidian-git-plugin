import { FileGroup, GitFile, GitState } from './types'
import { simpleGit, SimpleGit } from 'simple-git'
import * as fs from 'fs'
import * as path from 'path'

const GIT_PATH_SEP: string = '/'
let vaultDir: string
let git: SimpleGit

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

export async function listGitFiles(): Promise<FileGroup> {
  const status = await git.status()
  const changed: GitFile[] = []
  const untracked: GitFile[] = []

  classifyFile(changed, status.created, 'added')
  classifyFile(changed, status.modified, 'modified')
  classifyFile(changed, status.deleted, 'deleted')
  classifyFile(untracked, status.not_added, 'untracked')

  changed.forEach(formatFiles)
  changed.sort((a, b) => a.type.length - b.type.length)
  untracked.forEach(formatFiles)
  untracked.sort((a, b) => a.type.length - b.type.length)
  return { changed, untracked }
}

function formatFiles(item: GitFile) {
  let fileNum = 0
  if (item.type === 'file') {
    return 1
  } else if (item.children?.length) {
    for (const child of item.children) {
      fileNum += formatFiles(child)
    }
    item.children.sort((a, b) => a.type.length - b.type.length)
  }
  item.fileNum = fileNum
  return fileNum
}

function classifyFile(sourceList: GitFile[], fileList: string[], status: GitState) {
  for (const filename of fileList) {
    const absFilePath = path.join(vaultDir, filename)
    const fileType = status === 'deleted' ? 'file' : fs.statSync(absFilePath).isDirectory() ? 'dir' : 'file'
    // TODO 出现一个目录的文件，可能是submodule。目前先做忽略处理，也就是不记录该目录
    if (fileType === 'dir') {
      console.log('ignore submodule:', absFilePath)
      continue
    }

    const pathArray = filename.split(GIT_PATH_SEP)
    let parentNode: GitFile
    let relFilePath = ''
    for (const [index, singlePath] of pathArray.entries()) {
      relFilePath += (index === 0 ? '' : GIT_PATH_SEP) + singlePath

      // 默认当作 dir 处理
      const item: GitFile = {
        name: singlePath,
        path: relFilePath,
        type: 'dir',
        children: [],
      }
      // 最后一段补齐后改为 file
      if (index === pathArray.length - 1) {
        delete item.children
        item.status = status
        item.type = 'file'
      }

      if (index === 0) {
        parentNode = findOrCreateNode(sourceList, relFilePath, item)
      } else {
        parentNode!.children = parentNode!.children || []
        parentNode = findOrCreateNode(parentNode!.children, relFilePath, item)
      }

    }
  }
}

function walkDirectory(sourceList: GitFile[], dirpath: string, status: GitState) {
  if (!fs.existsSync(dirpath)) return
  const filenameList = fs.readdirSync(dirpath)
  for (const filename of filenameList) {
    const fullpath = path.join(dirpath, filename)
    if (fs.statSync(fullpath).isFile()) {
      const item: GitFile = {
        name: filename,
        path: fullpath,
        type: 'file',
        status: status
      }
      sourceList.push(item)
    } else if (fs.statSync(fullpath).isDirectory()) {
      const item: GitFile = {
        name: filename,
        path: fullpath,
        type: 'dir'
      }
      sourceList.push(item)
      item.children = []
      walkDirectory(item.children, fullpath, status)
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

export function commit(files: string[], commitMessage: string) {
  return git.commit(commitMessage, files)
}

export function add(files: string[]) {
  return git.add(files)
}

export function push() {
  return git.push()
}

export function revert(files: string[]) {
  return git.raw('checkout', '--', files.join(' '))
}

export function init(baseDir?: string) {
  vaultDir = scanGitDirs(baseDir).pop() as string
  git = simpleGit(vaultDir)
}

export function pull() {
  return git.pull()
}
