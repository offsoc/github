export const DragAndDropResources = {
  instructions: (title: string | number) => `Moving ${title}.`,
  firstItemInList: 'First item in list.',
  lastItemInList: 'Last item in list.',
  movedBetween: (itemA: string, itemB: string) => `Between ${itemA} and ${itemB}.`,
  movePosition: 'Move item one position',
  cancelDrag: 'Cancel drag mode',
  endDrag: 'Place item',
  cancelMove: (title: string) => `Cancel moving ${title}`,
  successfulFirstMove: (title: string) => `${title} successfully moved to first item in list.`,
  successfulLastMove: (title: string) => `${title} successfully moved to last item in list.`,
  successfulMove: (titleA: string, titleB: string, titleC: string) =>
    `${titleA} successfully moved between ${titleB} and ${titleC}.`,
  successfulNoMove: (title: string) => `${title} did not move.`,
  emptyAnnouncement: () => '',
  entryLessThanOne: 'Entry must be greater than 0.',
  entryGreaterThanList: (length: number) => `Entry must be less than or equal to ${length}.`,
  entryIsRequired: 'Entry is required.',
  entryIsInvalid: 'Entry is invalid.',
}

export const DragAndDropMovingResources = {
  itemWillNotBeMoved: (title: string) => `${title} will not be moved.`,
  movedToFirst: (title: string) => `${title} will be first item in the list.`,
  movedToLast: (title: string) => `${title} will be last item in the list.`,
  movedBetween: (title: string, item1: string | undefined, item2: string | undefined) =>
    `${title} will be between ${item1} and ${item2}.`,
  cannotBeMoved: (title: string) => `${title} cannot be moved to an invalid position.`,
}
