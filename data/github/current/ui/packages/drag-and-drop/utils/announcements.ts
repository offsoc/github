import {debounce} from '@github/mini-throttle'
import {announce} from '@github-ui/aria-live'

import {DragAndDropResources} from './strings'
import type {DragAndDropItem} from './types'

const emptyAnnouncement = () => ''

/**
 * Announces a message to screen readers at a slowed-down rate. This is useful when you want to announce
 * drag and drop movements to screen readers but you don't want to overwhelm the user with too many announcements
 * in rapid succession. Do not use this function if interactions that trigger announcements do not happen rapidly.
 */
export const debounceAnnouncement = debounce((announcement: string) => {
  announce(announcement, {assertive: true})
}, 100)

/*
 * When passed into dnd-kit's DNDContext default announcements will be turned off.
 * This is useful and should only be used when you want to provide your own announcements.
 */
export const defaultAnnouncementsOff = {
  onDragStart: emptyAnnouncement,
  onDragOver: emptyAnnouncement,
  onDragMove: emptyAnnouncement,
  onDragEnd: emptyAnnouncement,
  onDragCancel: emptyAnnouncement,
}

export function successfulMoveAnnouncement({
  newIndex,
  currentIndex,
  items,
  title,
}: {
  newIndex: number
  currentIndex: number
  items: DragAndDropItem[]
  title: string
}) {
  const itemIds = items.map(item => item.id)
  if (newIndex === currentIndex) {
    announce(DragAndDropResources.successfulNoMove(title), {assertive: true})
  } else if (newIndex === 0) {
    announce(DragAndDropResources.successfulFirstMove(title), {assertive: true})
  } else if (newIndex === items.length - 1) {
    announce(DragAndDropResources.successfulLastMove(title), {assertive: true})
  } else {
    const isBefore = newIndex <= currentIndex
    const itemA = isBefore ? itemIds[newIndex - 1] : itemIds[newIndex + 1]
    const itemB = itemIds[newIndex]
    const itemATitle = items.find(item => item.id === itemA)?.title ?? ''
    const itemBTitle = items.find(item => item.id === itemB)?.title ?? ''

    announce(DragAndDropResources.successfulMove(title, itemATitle, itemBTitle), {assertive: true})
  }
}
