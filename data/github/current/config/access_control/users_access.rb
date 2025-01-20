# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl

  define_access :read_user_public do |access|
    access.allow :everyone
  end

  define_access :read_toggleable_feature do |access|
    access.allow :everyone
  end

  define_access :read_user_private do |access|
    access.allow :user_self_reader
    access.allow :site_admin do
      GitHub.enterprise_only_api_enabled?
    end
  end

  define_access :v4_read_user_private do |access|
    access.allow :user_self_reader
  end

  define_access :read_user do |access|
    access.allow :user_reader
  end

  define_access :read_user_hovercard do |access|
    access.allow :user_hovercard_reader
  end

  define_access :read_user_installations do |access|
    access.allow :user_installations_reader
  end

  define_access :read_user_audit_log do |access|
    access.ensure_context :user, :resource
    access.allow :user_audit_log_reader
  end

  define_access :read_user_dashboard do |access|
    access.allow :user_self_reader
  end

  define_access :list_user_emails  do |access|
    access.ensure_context :user

    access.allow :user_emailer do |context|
      !context[:user].using_auth_via_granular_actor?
    end

    access.allow :user_email_reader do |context|
      context[:user].using_auth_via_granular_actor?
    end
  end

  define_access :list_user_public_emails  do |access|
    access.ensure_context :user
  end

  define_access :v4_get_user_email  do |access|
    access.ensure_context :user
    access.allow :v4_user_emailer
  end

  define_access :read_user_plan do |access|
    access.ensure_context :user, :resource
    access.allow :user_plan_reader
  end

  define_access :update_user do |access|
    access.allow :user_editor
  end

  define_access :update_user_profile do |access|
    access.ensure_context :user
    access.allow :user_profile_writer
  end

  define_access :add_user_emails, :delete_user_emails, :toggle_email_visibility  do |access|
    access.ensure_context :user

    access.allow :user_editor do |context|
      !context[:user].using_auth_via_granular_actor?
    end

    access.allow :user_email_writer do |context|
      context[:user].using_auth_via_granular_actor?
    end
  end

  define_access :read_user_followers, :read_user_following do |access|
    access.ensure_context :user
    access.allow :user_followers_reader
  end

  define_access :follow, :unfollow do |access|
    access.ensure_context :user
    access.allow :user_followers_writer
  end

  define_access :read_blocks do |access|
    access.ensure_context :user
    access.allow :user_blocking_reader
  end

  define_access :block, :unblock do |access|
    access.ensure_context :user
    access.allow :user_blocking_writer
  end

  define_access :list_public_keys do |access|
    access.ensure_context :user

    access.allow :public_key_reader do |context|
      !context[:user].using_auth_via_granular_actor?
    end

    access.allow :public_key_writer do |context|
      !context[:user].using_auth_via_granular_actor?
    end

    access.allow :public_key_admin do |context|
      !context[:user].using_auth_via_granular_actor?
    end

    access.allow :user_keys_reader do |context|
      context[:user].using_auth_via_granular_actor?
    end
  end

  define_access :read_public_key do |access|
    access.ensure_context :user, :resource, :authenticated_user do |actor, key, user|
      key_belongs_to_actor = actor && key&.user_id == actor.id
      key_belongs_to_user = user && key&.user_id == user.id

      key_belongs_to_actor || key_belongs_to_user
    end

    access.allow :public_key_reader do |context|
      !context[:user].using_auth_via_granular_actor?
    end

    access.allow :public_key_writer do |context|
      !context[:user].using_auth_via_granular_actor?
    end

    access.allow :public_key_admin do |context|
      !context[:user].using_auth_via_granular_actor?
    end

    access.allow :user_keys_reader do |context|
      context[:user].using_auth_via_granular_actor?
    end

    access.allow :user_keys_reader do |context|
      context[:user].bot? &&
        context[:authenticated_user]&.using_auth_via_integration?
    end
  end

  define_access :add_public_key do |access|
    access.ensure_context :user

    access.allow :public_key_admin do |context|
      !context[:user].using_auth_via_granular_actor?
    end

    access.allow :public_key_writer do |context|
      !context[:user].using_auth_via_granular_actor?
    end

    access.allow :user_keys_writer do |context|
      context[:user].using_auth_via_granular_actor?
    end

    access.allow :user_keys_writer do |context|
      context[:user].bot? &&
        context[:authenticated_user]&.using_auth_via_integration?
    end
  end

  define_access :update_public_key do |access|
    access.ensure_context :user, :resource do |user, key|
      user && key.try(:user_id) == user.id
    end

    access.allow :public_key_admin do |context|
      !context[:user].using_auth_via_integration?
    end

    access.allow :public_key_writer do |context|
      !context[:user].using_auth_via_integration?
    end

    access.allow :user_keys_writer do |context|
      context[:user].using_auth_via_integration?
    end
  end

  define_access :remove_public_key do |access|
    access.ensure_context :user, :resource, :authenticated_user do |actor, public_key, authenticated_user|
      if actor && actor.bot?
        authenticated_user && public_key.try(:user_id) == authenticated_user.id
      else
        actor && public_key.try(:user_id) == actor.id
      end
    end

    access.allow :public_key_admin do |context|
      !context[:user].using_auth_via_granular_actor?
    end

    access.allow :user_keys_writer do |context|
      context[:user].using_auth_via_granular_actor?
    end
  end

  define_access :list_gpg_keys do |access|
    access.ensure_context :user
    access.allow :gpg_key_lister
  end

  define_access :read_gpg_key do |access|
    access.ensure_context :user, :resource, :authenticated_user do |actor, gpg_key, user|
      gpg_key_belongs_to_actor = actor && gpg_key&.user_id == actor.id
      gpg_key_belongs_to_user = user && gpg_key&.user_id == user.id

      gpg_key_belongs_to_actor || gpg_key_belongs_to_user
    end

    access.allow :gpg_key_reader
  end

  define_access :add_gpg_key do |access|
    access.ensure_context :user
    access.allow :gpg_key_writer
  end

  define_access :remove_gpg_key do |access|
    access.ensure_context :user, :resource, :authenticated_user do |actor, gpg_key, authenticated_user|
      next false unless actor && gpg_key

      if actor.bot?
        authenticated_user && gpg_key.user_id == authenticated_user.id
      else
        gpg_key.user_id == actor.id
      end
    end

    access.allow :gpg_key_admin
  end

  define_access :list_ssh_signing_keys do |access|
    access.ensure_context :user
    access.allow :ssh_signing_key_lister
  end

  define_access :read_ssh_signing_key do |access|
    access.ensure_context :user, :resource, :authenticated_user do |actor, ssh_signing_key, user|
      ssh_signing_key_belongs_to_actor = actor && ssh_signing_key&.user_id == actor.id
      ssh_signing_key_belongs_to_user = user && ssh_signing_key&.user_id == user.id

      ssh_signing_key_belongs_to_actor || ssh_signing_key_belongs_to_user
    end

    access.allow :ssh_signing_key_reader
  end

  define_access :add_ssh_signing_key do |access|
    access.ensure_context :user
    access.allow :ssh_signing_key_writer
  end

  define_access :remove_ssh_signing_key do |access|
    access.ensure_context :user, :resource, :authenticated_user do |actor, ssh_signing_key, authenticated_user|
      next false unless actor && ssh_signing_key

      if actor.bot?
        authenticated_user && ssh_signing_key.user_id == authenticated_user.id
      else
        ssh_signing_key.user_id == actor.id
      end
    end

    access.allow :ssh_signing_key_admin
  end

  define_access :suspend, :unsuspend do |access|
    access.allow :site_admin
  end

  define_access :mobile_support_token do |access|
    access.ensure_context :user
    access.allow :github_mobile_apps_support_token
  end

  define_access :promote_dotcom_user, :demote_site_admin do |access|
    access.allow :site_admin
  end

  define_access :read_spammy_state do |access|
    access.allow :user_self_reader
    access.allow :site_admin
  end

  define_access :v4_get_repository_invitation do |access|
    access.allow(:v4_repository_invitation_reader)
  end

  define_access :read_user_private_repository_invitations do |access|
    access.allow(:user_private_repository_invitation_reader)
  end

  define_access :read_user_public_repository_invitations do |access|
    access.allow(:user_public_repository_invitation_reader)
  end

  define_access :accept_or_decline_repo_invitation do |access|
    access.allow :repository_invitation_accepter
  end

  define_access :v4_list_user_private_resources do |access|
    access.allow :v4_private_resource_lister
  end

  define_access :read_user_interaction_limits do |access|
    access.ensure_context :resource, :user
    access.allow :user_interaction_limits_reader
  end

  define_access :write_user_interaction_limits do |access|
    access.ensure_context :resource, :user
    access.allow :user_interaction_limits_writer
  end

  define_access :read_user_reminders do |access|
    access.allow :user_reminders_reader
  end
end
