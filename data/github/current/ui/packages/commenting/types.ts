export type CommentingAppPayload =
  | {
      current_user_settings?: {
        use_monospace_font: boolean
        use_single_key_shortcut: boolean
      }
      paste_url_link_as_plain_text: boolean
    }
  | undefined
