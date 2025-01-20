# typed: strict
# frozen_string_literal: true

T.bind(self, ActionDispatch::Routing::Mapper)

get "sponsors",                 to: "businesses/sponsors_settings#show",            as: :settings_sponsors
put "sponsors",                 to: "businesses/sponsors_settings#update",          as: :settings_sponsors_update_policy
get "sponsors/org_suggestions", to: "businesses/sponsors_settings#org_suggestions", as: :settings_sponsors_org_suggestions
