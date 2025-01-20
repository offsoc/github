# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :alive_events_subscriber do |access|
    access.ensure_context :user, :resource
    access.allow :alive_events_subscriber
  end
end
