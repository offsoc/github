# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :github_app_viewer do |access|
    access.ensure_context :resource
    access.allow :github_app_reader
  end

  define_access :manage_github_app do |access|
    access.ensure_context :resource
    access.allow :github_app_manager
  end
end
