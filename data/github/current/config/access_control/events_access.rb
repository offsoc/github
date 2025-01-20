# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl

  define_access :list_user_events do |access|
    access.allow :event_reader
  end

  define_access :list_user_org_events do |access|
    access.allow :user_org_event_reader
  end
end
