import {expect} from '@playwright/test'

import {testPlatformMeta} from '../helpers/utils'
import {BasePageViewWithMemexApp} from './base-page-view'

export class CommandMenu extends BasePageViewWithMemexApp {
  COMMAND_PALETTE_INPUT = this.page.getByTestId('command-palette-input')
  FILTERED_COMMANDS = this.page.getByTestId('command-menu-filtered-commands')
  FILTERED_COMMANDS_ENTRIES = this.FILTERED_COMMANDS.locator('li')

  public async triggerCommandPalette() {
    await this.page.keyboard.press(`${testPlatformMeta}+k`)
    await this.COMMAND_PALETTE_INPUT.waitFor({state: 'visible'})
  }

  public async searchFor(text: string) {
    await this.page.keyboard.type(text)
    await this.waitForResults()
  }

  public async expectFilteredResults(count: number) {
    await this.waitForResults()
    await expect(this.FILTERED_COMMANDS_ENTRIES).toHaveCount(count)
  }

  public async assertNotInResults(text: string) {
    await this.waitForResults()
    const menuItemWithText = this.FILTERED_COMMANDS.locator('li', {hasText: text})

    await expect(menuItemWithText).toBeHidden()
  }

  private async waitForResults() {
    await this.FILTERED_COMMANDS.waitFor({state: 'visible'})
  }
}
