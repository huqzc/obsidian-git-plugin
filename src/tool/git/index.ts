import { FileGroup, GitFile, GitState } from './types'
import { simpleGit, SimpleGit } from 'simple-git'
import * as fs from 'fs'
import * as path from 'path'

const GIT_PATH_SEP: string = '/'
let gitDir: string
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
  untracked.forEach(formatFiles)
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
    const pathArray = filename.split(GIT_PATH_SEP)
    let fullpath = ''
    let parentNode: GitFile | null = null
    if (pathArray[pathArray.length - 1] === '') {
      continue
    }
    for (let i = 0; i < pathArray.length; i++) {
      const p = pathArray[i]
      fullpath += (i === 0 ? '' : GIT_PATH_SEP) + p

      if (p === '' && parentNode) {
        // p 为空，说明以目录结束，需要手动遍历该目录获取子目录及文件
        walkDirectory(parentNode.children, fullpath, status)
        continue
      }

      const item: GitFile = {
        name: pathArray[i],
        path: fullpath,
        // type: i !== pathArray.length - 1 ? 'dir' : 'file'
        type: fs.statSync(path.join(gitDir, fullpath)).isDirectory() ? 'dir' : 'file'
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

export function init(baseDir?: string) {
  gitDir = scanGitDirs(baseDir).pop() as string
  git = simpleGit(gitDir)
}
