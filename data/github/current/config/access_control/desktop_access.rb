# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :desktop_user do |access|
    access.ensure_context :user, :resource
    access.allow :desktop_user
  end
end
