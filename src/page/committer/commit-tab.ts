import { DataAdapter, ItemView, WorkspaceLeaf } from 'obsidian'
import { createApp } from 'vue'
import CommitPage from './CommitPage.vue'
import { eventBus } from '../../tool/eventBus'
import GitCommitterPlugin from '../../main'

export const VIEW_TYPE_NAME = 'git-committer'

// solve the problem of lack of basePath
interface AdapterBasePath extends DataAdapter{
  basePath: string
}

export class GitCommitter extends ItemView {
  plugin: GitCommitterPlugin

  constructor(leaf: WorkspaceLeaf, plugin: GitCommitterPlugin) {
    super(leaf)
    this.plugin = plugin
    this.registerEvent(this.app.vault.on('modify', this.handleModify))
    this.registerEvent(this.app.vault.on('create', this.handleModify))
    this.registerEvent(this.app.vault.on('delete', this.handleModify))
    this.registerEvent(this.app.vault.on('rename', this.handleModify))
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
    const adapter = this.app.vault.adapter as AdapterBasePath
    const baseDir = adapter.basePath as string
    const app = createApp(CommitPage, { baseDir, settings: this.plugin.settings })
    app.mount(container)
  }

  async onClose(): Promise<void> {
    eventBus.$off('modify')
    this.app.vault.off('modify', this.handleModify)
    this.app.vault.off('create', this.handleModify)
    this.app.vault.off('delete', this.handleModify)
    this.app.vault.off('rename', this.handleModify)
  }

  handleModify() {
    eventBus.$emit('modify')
  }
}
