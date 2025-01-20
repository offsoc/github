import type {Label} from './LabelsList'

export function mockUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Build a label object with default values.
 * Only used for testing.
 */
export function buildLabel(data: {
  id?: string
  name?: string
  nameHTML?: string
  color?: string
  url?: string
  description?: string | null
}): Label {
  return {
    id: data.id ?? mockUUID(),
    name: data.name ?? 'bug',
    nameHTML: data.nameHTML || data.name || 'bug',
    color: data.color ?? 'FFFFFF',
    url: data.url ?? 'https://www.example.com',
    description: data.description ?? 'This is a bug label',
  }
}
