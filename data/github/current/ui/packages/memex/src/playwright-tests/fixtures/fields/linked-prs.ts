import {expect, type Locator} from '@playwright/test'

export class LinkedPullRequestsTableCell {
  private LINKED_PR_LABEL: Locator

  constructor(cellLocator: Locator) {
    this.LINKED_PR_LABEL = cellLocator.getByTestId('linked-pr-token')
  }

  public async expectLinkedPullRequestLabelCount(count: number) {
    return expect(this.LINKED_PR_LABEL).toHaveCount(count)
  }

  public getLinkedPullRequestLabel(index: number): LinkedPullRequestLabel {
    return new LinkedPullRequestLabel(this.LINKED_PR_LABEL.nth(index))
  }
}

export class LinkedPullRequestLabel {
  private LINK_LABEL: Locator

  constructor(labelLocator: Locator) {
    this.LINK_LABEL = labelLocator
  }

  public async expectHovercardUrl(prUrl: string) {
    const expectedHovercardUrl = `${prUrl}/hovercard`
    return expect(this.LINK_LABEL).toHaveAttribute('data-hovercard-url', expectedHovercardUrl)
  }
}
