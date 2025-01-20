import type {PlatformId} from './platform'

export const imageUploadTypeOptions = [
  {displayName: 'Linux', id: 'linux-x64' satisfies PlatformId},
  {displayName: 'Windows', id: 'win-x64' satisfies PlatformId},
] as const
export type ImageUploadType = (typeof imageUploadTypeOptions)[number]

export type ImageUploadValues = {
  imageType: ImageUploadType
  sasUri: string
}
export const imageUploadValuesDefault = {
  imageType: imageUploadTypeOptions[0],
  sasUri: '',
} as const satisfies ImageUploadValues
