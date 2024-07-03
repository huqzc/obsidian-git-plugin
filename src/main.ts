import { Plugin, WorkspaceLeaf } from 'obsidian'
import { SampleSettingTab } from './page/setting/setting-tab'
import { GitCommitter, VIEW_TYPE_NAME } from './page/committer/commit-tab'

export interface PluginSettings {
  remoteRepoUrl: string
  submitThirdGitRepo: string

  modifiedFontColor: string
  addedFontColor: string
  deletedFontColor: string
  untrackedFontColor: string

  commitHistory: string[]
}

const DEFAULT_SETTINGS: PluginSettings = {
  remoteRepoUrl: '',
  submitThirdGitRepo: 'ignore',

  modifiedFontColor: '#3F93F4',
  addedFontColor: '#68AA72',
  deletedFontColor: '#AFAFAF',
  untrackedFontColor: '#DC362E',

  commitHistory: []
}

export default class GitCommitterPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS

  async onload() {
    await this.loadSettings()
    this.addSettingTab(new SampleSettingTab(this.app, this))
    this.registerView(VIEW_TYPE_NAME, leaf => new GitCommitter(leaf, this))

    this.addRibbonIcon('git-commit-horizontal', 'git', () => {
      this.activateView()
    })
  }

  onunload() {}

  async activateView() {
    const { workspace } = this.app

    let leaf: WorkspaceLeaf | null = null
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_NAME)

    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      leaf = leaves[0]
    } else {
      // Our view could not be found in the workspace, create a new leaf
      // in the right sidebar for it
      leaf = workspace.getRightLeaf(false)
      await leaf?.setViewState({ type: VIEW_TYPE_NAME, active: true })
    }

    // "Reveal" the leaf in case it is in a collapsed sidebar
    workspace.revealLeaf(leaf as WorkspaceLeaf)
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
