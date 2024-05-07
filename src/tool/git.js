import git from 'isomorphic-git'
import fs from 'fs'
import path from 'path'

const GIT_PATH_SEP = '/'

/**
 * 获取当前路径中存在的所有 git 项目路径
 * @param [dir] 目录
 * @return {string[]}
 */
function getGitDirs(dir) {
  const gitDirList = []

  let currentDir = dir || __dirname
  do {
    const gitpath = path.join(currentDir, '.git')
    const exist = fs.existsSync(gitpath)
    if (exist) {
      gitDirList.push(currentDir)
    }
  } while (currentDir !== (currentDir = path.join(currentDir, '..')))
  return gitDirList
}

export const gitDir = getGitDirs().pop()

async function listGitFiles() {
  const status = await git.statusMatrix({ fs, dir: gitDir })
  console.log('status =', status)
  return groupGitFile(status)
}

function groupGitFile(statusList) {
  const changed = []
  const untracked = []
  const itemList = []
  for (const [filename, head, workdir, stage] of statusList) {
    // 跳过未修改文件
    if (head === 1 && workdir === 1) continue
    // 获取文件 git 状态
    let status = ''
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
    let parentNode = null
    for (let i = 0; i < pathArray.length; i++) {
      const p = pathArray[i]
      fullpath += GIT_PATH_SEP + p

      const item = {}
      item.name = pathArray[i]
      item.path = fullpath
      item.type = i !== pathArray.length - 1 ? 'dir' : 'file'
      if (i === pathArray.length - 1) {
        item.status = status
      }

      if (i === 0) {
        parentNode = findOrCreateNode(source, p, item)
      } else {
        parentNode.children = parentNode.children || []
        parentNode = findOrCreateNode(parentNode.children, p, item)
      }
    }
  }
  return { changed, untracked }
}

function findOrCreateNode(list, key, item) {
  let node = list.find(item => item.key === key)
  if (!node) {
    node = { key, ...item }
    list.push(node)
  }
  return node
}

export default { listGitFiles }
