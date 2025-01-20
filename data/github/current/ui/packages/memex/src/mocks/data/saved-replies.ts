export interface SavedReply {
  id: number
  title: string
  body: string
  default: boolean
}

export const mockSavedReplies: Array<SavedReply> = [
  {id: 1, title: 'Hello world', body: 'Hello world!', default: false},
  {id: 2, title: 'Fixes issue', body: 'Fixes #', default: true},
  {id: 3, title: 'Duplicate', body: 'Duplicate of #', default: true},
  {id: 4, title: 'Ship it', body: 'LGTM! :ship:', default: false},
]
