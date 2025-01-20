import {expect, type Locator} from '@playwright/test'

import {mockMemexAliveConfig} from '../../mocks/socket-message'
import {BasePageViewWithMemexApp} from './base-page-view'

export class Presence extends BasePageViewWithMemexApp {
  PRESENCE_AVATAR_STACK_LOCATOR = this.page.getByTestId('presence-avatars').getByTestId('memex-avatar-stack')
  PRESENCE_SOCKET_CHANNEL_ELEMENT_LOCATOR = this.page.locator(
    `.js-socket-channel[data-channel=${mockMemexAliveConfig.presenceChannel}]`,
  )
  MAX_AVATARS_TO_LIST = 5
  AVATAR_ITEMS = this.PRESENCE_AVATAR_STACK_LOCATOR.getByTestId('memex-avatar-stack-item')
  AVATAR_OVERLOW = this.PRESENCE_AVATAR_STACK_LOCATOR.getByTestId('memex-avatar-stack-overflow')

  IDLE_AVATARS = this.PRESENCE_AVATAR_STACK_LOCATOR.getByTestId('memex-avatar-state-idle')
  ACTIVE_AVATARS = this.PRESENCE_AVATAR_STACK_LOCATOR.getByTestId('memex-avatar-state-active')

  async expectPresenceAvatarStackNotToBeFound() {
    return this.memex.expectLocatorNotToBeFound(this.PRESENCE_AVATAR_STACK_LOCATOR)
  }

  async emitMockMessageOnPresenceChannel(
    users: ReadonlyArray<{userId: number; isOwnUser?: boolean; isIdle?: boolean}>,
  ) {
    return this.PRESENCE_SOCKET_CHANNEL_ELEMENT_LOCATOR.evaluate((el, data) => {
      if (!el.dispatchEvent(new CustomEvent('socket:presence', {detail: {data}}))) {
        throw new Error('Failed to dispatch event')
      }
      return true
    }, users)
  }

  async expectAvatarHovercardUrl(index: number, userId: number) {
    return new PresenceAvatar(this.AVATAR_ITEMS.nth(index)).expectHovercardUrl(userId)
  }

  async expectIdleAvatarCount(count: number) {
    return expect(this.IDLE_AVATARS).toHaveCount(count)
  }

  async expectActiveAvatarCount(count: number) {
    return expect(this.ACTIVE_AVATARS).toHaveCount(count)
  }

  async expectAvatarCount(count: number) {
    return expect(this.AVATAR_ITEMS).toHaveCount(count)
  }

  async expectAvatarOverflowToHaveCount(count: number) {
    return expect(this.AVATAR_OVERLOW).toContainText(`+${count}`)
  }
}

class PresenceAvatar {
  private IMG: Locator

  constructor(labelLocator: Locator) {
    this.IMG = labelLocator.locator('img')
  }

  public async expectHovercardUrl(userId: number) {
    const expectedHovercardUrl = `/hovercards?user_id=${userId}`
    return expect(this.IMG).toHaveAttribute('data-hovercard-url', expectedHovercardUrl)
  }
}
