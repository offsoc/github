# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :get_package do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow :repo_packages_reader
  end

  define_access :get_package_v2 do |access|
    access.allow :packages_reader_v2
  end

  define_access :delete_package_v2 do |access|
    access.ensure_context :user
    access.allow :packages_deleter_v2
  end

  define_access :restore_package_v2 do |access|
    access.ensure_context :user
    access.allow :packages_restorer_v2
  end

  define_access :create_package do |access|
    access.ensure_context :repo
    access.allow :repo_packages_writer
  end

  define_access :list_packages do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow :repo_packages_reader
  end

  define_access :delete_package do |access|
    access.ensure_context :repo
    access.allow :repo_packages_deleter
  end

  define_access :restore_package do |access|
    access.ensure_context :repo
    access.allow :repo_packages_restorer
  end

  define_access :authenticate_for_registry do |access|
    access.ensure_context :user
    access.allow(:authenticated_bot_using_installation_token) { |context| context.user && context.user.try(:installation) }
    access.allow(:authenticated_user_using_personal_access_token)
    access.allow(:codespace_user)
    access.allow(:packages_reader_v2) { |context| GitHub.flipper[:packages_oauth_tokens].enabled?(context.user) }
  end
end
