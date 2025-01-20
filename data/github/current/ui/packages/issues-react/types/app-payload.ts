import type {SsoAppPayload} from '@github-ui/use-sso'
import type {UserHookPayload} from '@github-ui/use-user'

export type AppPayload = {
  enabled_features: {[key: string]: boolean}
  feedback_url: string
  initial_view_content: {
    team_id: string | undefined
    can_edit_view: boolean
  }
  current_user: {
    avatarUrl: string
    id: string
    login: string
    name: string
    is_staff: boolean
  }
  current_user_settings: {
    use_monospace_font: boolean
    use_single_key_shortcut: boolean
    preferred_emoji_skin_tone?: number
  }
  paste_url_link_as_plain_text: boolean
  tracing: boolean
  tracing_flamegraph: boolean
  catalog_service: string
  scoped_repository?: {id: string; name: string; owner: string; is_archived: boolean}
  proxima: boolean
  render_opt_out: boolean
} & SsoAppPayload &
  UserHookPayload
