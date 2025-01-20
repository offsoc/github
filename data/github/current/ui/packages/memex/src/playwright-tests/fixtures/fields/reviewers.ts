import {expect, type Locator} from '@playwright/test'

class ReviewersContainer {
  private REVIEWER_AVATAR: Locator

  constructor(containerLocator: Locator) {
    this.REVIEWER_AVATAR = containerLocator.locator('img')
  }

  public async expectReviewersCount(count: number) {
    return expect(this.REVIEWER_AVATAR).toHaveCount(count)
  }

  public async expectUserHovercardUrl(index: number, userId: number) {
    const expectedHovercardUrl = `/hovercards?user_id=${userId}`
    return expect(this.REVIEWER_AVATAR.nth(index)).toHaveAttribute('data-hovercard-url', expectedHovercardUrl)
  }

  public async expectTeamHovercardUrl(index: number, url: string) {
    const expectedHovercardUrl = `${url}/hovercard`
    return expect(this.REVIEWER_AVATAR.nth(index)).toHaveAttribute('data-hovercard-url', expectedHovercardUrl)
  }
}

export class ReviewersTableCell extends ReviewersContainer {
  constructor(containerLocator: Locator) {
    super(containerLocator)
  }
}

export class ReviewersLabel extends ReviewersContainer {
  constructor(containerLocator: Locator) {
    super(containerLocator)
  }
}
