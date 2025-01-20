# frozen_string_literal: true


# One-Click unsubscribe (RFC-8058)
# See https://datatracker.ietf.org/doc/html/rfc8058
post "/notifications/unsubscribe/one-click/:token", to: "notifications/one_click_unsubscriptions#create", as: :notifications_one_click_unsubscribe

# Legacy email unsubscribe, maintained for backwards compatibility. They keep
# the same public route but drive to the new implementation that is built
# around the One-Click unsubscribe of RFC-8058
#
# NOTE(franciscoj): [On 25/01/2024] We want to enventually remove any usage of
# these routes and redirect them into a new unsubscription system based on the
# One-Click process on RFC-8058. For now our only goal has been to implement
# the bare minimum of One-Click unsubscribe due to deadlines with the Google
# requirements for bulk senders to Gmail coming up February 1st 2024
get "/notifications/unsubscribe/:data",      to: "notifications#email_mute_via_list",   as: :email_mute_via_list
get "/notifications/unsubscribe-auth/:data", to: "notifications#email_mute_via_footer", as: :email_mute_via_footer
