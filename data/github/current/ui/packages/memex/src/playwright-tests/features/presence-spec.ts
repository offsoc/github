import {mockUsers} from '../../mocks/data/users'
import {test} from '../fixtures/test-extended'

test.describe('Presence', () => {
  /**
   * Navigate and remove presence items from DOM
   */
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestPresence')
  })

  test('should not have the presence element in the dom', async ({memex}) => {
    await memex.presence.expectPresenceAvatarStackNotToBeFound()
  })

  test('should have the presence avatars and overflow', async ({memex}) => {
    const loggedInUserId = await memex.getLoggedInUserId()

    const messageDetail = mockUsers.map(user => {
      const {id: userId} = user
      return {
        userId,
        isOwnUser: userId === loggedInUserId,
      }
    })
    const countOfNotOwnUser = messageDetail.filter(item => !item.isOwnUser).length

    await memex.presence.emitMockMessageOnPresenceChannel(messageDetail)

    await memex.presence.expectAvatarCount(Math.min(countOfNotOwnUser, memex.presence.MAX_AVATARS_TO_LIST))
    await memex.presence.expectAvatarOverflowToHaveCount(countOfNotOwnUser - memex.presence.MAX_AVATARS_TO_LIST)
  })

  test('should not include current logged in user', async ({memex}) => {
    const loggedInUserId = await memex.getLoggedInUserId()

    /**
     * Adds current user, plus a few extra, but not enough to overflow
     */
    const userData = [
      {
        userId: loggedInUserId,
        isOwnUser: true,
      },
      ...mockUsers
        .filter(user => user.id !== loggedInUserId)
        .slice(0, 2)
        .map(user => ({userId: user.id})),
    ]

    await memex.presence.emitMockMessageOnPresenceChannel(userData)

    await memex.presence.expectAvatarCount(userData.length - 1)
  })

  test('should show idle users as idle and active users as active', async ({memex}) => {
    const loggedInUserId = await memex.getLoggedInUserId()

    const messageDetail = mockUsers
      .map((user, index) => {
        const {id: userId} = user
        return {
          userId,
          isOwnUser: userId === loggedInUserId,
          isIdle: index % 2 === 0,
        }
      })
      .slice(0, memex.presence.MAX_AVATARS_TO_LIST)

    await memex.presence.emitMockMessageOnPresenceChannel(messageDetail)

    await memex.presence.expectIdleAvatarCount(2)
    await memex.presence.expectActiveAvatarCount(2)
  })
})
