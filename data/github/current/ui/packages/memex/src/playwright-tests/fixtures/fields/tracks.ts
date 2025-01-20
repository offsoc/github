import {expect, type Locator} from '@playwright/test'

class TracksContainer {
  private PROGRESS_TEXT: Locator

  constructor(containerLocator: Locator) {
    this.PROGRESS_TEXT = containerLocator.getByTestId('progress-text')
  }

  public async expectTracksProgressText(progressText: string) {
    return expect(this.PROGRESS_TEXT).toHaveText(progressText)
  }
}

export class TracksTableCell extends TracksContainer {
  constructor(containerLocator: Locator) {
    super(containerLocator)
  }
}
