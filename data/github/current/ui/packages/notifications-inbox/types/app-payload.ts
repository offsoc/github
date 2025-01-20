import type {UserHookPayload} from '../utils/hooks/use-user'
import type {SsoAppPayload} from '../utils/sso/SsoAppPayloadAdapter'

export type AppPayload = {
  enabled_features: {[key: string]: boolean}
  paste_url_link_as_plain_text: boolean
  use_monospace_font: boolean
  tracing: boolean
  tracing_flamegraph: boolean
  user_prefers_notifications_grouped_by_list: boolean
} & SsoAppPayload &
  UserHookPayload
