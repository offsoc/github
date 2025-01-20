import {expect, type Locator} from '@playwright/test'

class AssigneesContainer {
  private ASSIGNEE_AVATAR: Locator

  constructor(containerLocator: Locator) {
    this.ASSIGNEE_AVATAR = containerLocator.locator('img')
  }

  public async expectNoHovercardUrl(index: number) {
    const attributeValue = await this.ASSIGNEE_AVATAR.nth(index).getAttribute('data-hovercard-url')
    expect(attributeValue).toBeNull()
  }

  public async getAssigneeNames() {
    const imgs = this.ASSIGNEE_AVATAR
    const imgCount = await imgs.count()

    const assigneeNames: Array<string> = []
    for (let i = 0; i < imgCount; i++) {
      const alt = await imgs.nth(i).getAttribute('alt')
      assigneeNames.push(alt)
    }
    return assigneeNames
  }
}

export class CardAssignees extends AssigneesContainer {}
export class AssigneesTableCell extends AssigneesContainer {}
