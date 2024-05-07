import { ItemView, WorkspaceLeaf } from 'obsidian'
import git from '../../tool/git.js'
import { createApp } from 'vue'
import CommitPage from './CommitPage.vue'

export const VIEW_TYPE_NAME = 'git-committer'

export class GitCommitter extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf)
  }

  getViewType(): string {
    return VIEW_TYPE_NAME
  }

  getDisplayText(): string {
    return 'git committer'
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1]
    container.empty()
    const files = await git.listGitFiles()
    console.log('files = ', files)
    createApp(CommitPage, { gitFiles: files }).mount(container)
  }

  async onClose(): Promise<void> {

  }
}
