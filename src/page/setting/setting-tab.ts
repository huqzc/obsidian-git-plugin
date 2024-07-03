import { App, PluginSettingTab, Setting } from 'obsidian'
import SamplePlugin from '../../main'

export class SampleSettingTab extends PluginSettingTab {
  plugin: SamplePlugin

  constructor(app: App, plugin: SamplePlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display() {
    const { containerEl } = this
    containerEl.empty()
    // createApp(SampleSettingTabPage).mount(containerEl)

    new Setting(containerEl)
      .setName('Remote repository url')
      .setDesc('The remote repository url of this vault.')
      .addText(text => {
        text
          .setPlaceholder('https://github.com/your-username/your-repo.git')
          .setValue(this.plugin.settings.remoteRepoUrl)
          .onChange(async value => {
            this.plugin.settings.remoteRepoUrl = value
            await this.plugin.saveSettings()
          })
      })

    new Setting(containerEl)
      .setName('Submit other git repositories')
      .setDesc('Submit the source code of other git repositories in this vault.')
      .addDropdown(dropdown => {
        dropdown.addOption('0', 'NO')
        dropdown.addOption('1', 'YES')
        dropdown.onChange(async value => {
          this.plugin.settings.submitThirdGitRepo = value
          await this.plugin.saveSettings()
        })
      })
  }
}
