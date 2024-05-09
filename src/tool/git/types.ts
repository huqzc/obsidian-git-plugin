export interface GitFile {
  name: string
  path: string
  type: string
  status?: string
  children?: GitFile[]
  fileNum?: number

  [key: string]: any
}

export type FileStates = [string, 0 | 1, 0 | 1 | 2, 0 | 1 | 2 | 3]

export type GitState = 'untracked' | 'added' | 'modified' | 'deleted' | undefined

export interface FileGroup {
  changed: GitFile[]
  untracked: GitFile[]
}
