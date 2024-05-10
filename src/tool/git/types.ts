export interface GitFile {
  name: string
  path: string
  type: 'dir' | 'file'
  status?: GitState
  children?: GitFile[]
  fileNum?: number

  [key: string]: any
}

export type GitState = 'untracked' | 'added' | 'modified' | 'deleted'

export interface FileGroup {
  changed: GitFile[]
  untracked: GitFile[]
}
