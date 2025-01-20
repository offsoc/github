import type {PathFunction} from '@github-ui/paths'

export const dismissNoticePath: PathFunction<{notice: string}> = ({notice}) => `/settings/dismiss-notice/${notice}`
