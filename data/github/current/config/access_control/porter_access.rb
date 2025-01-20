# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl

  define_access :set_import_state do |access|
    access.ensure_context :resource
    access.allow :repo_resources_writer
  end

  define_access :receive_import_status do |access|
    access.ensure_context :resource
    access.allow :repo_resources_writer
  end

  define_access :send_message do |access|
    access.ensure_context :resource
    access.allow :repo_resources_writer
  end

  define_access :manage_import_reader do |access|
    access.ensure_context :resource

    access.allow :repo_contents_writer do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor && !actor.can_have_granular_permissions?
    end

    # We actually only want to enable read permissions
    # for actors with granular permissions
    # like an IntegrationInstallation.
    access.allow :repo_contents_reader do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor && actor.can_have_granular_permissions?
    end
  end

  define_access :manage_import_writer do |access|
    access.ensure_context :resource
    access.allow :repo_contents_writer
  end
end
