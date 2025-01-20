#!/usr/bin/env safe-ruby
# typed: true
# frozen_string_literal: true

require_relative "../config/environment"

unless Rails.env.development? || Rails.env.test?
  abort "This can only be run in development"
end

class CreateLaunchGitHubApp
  def create_app
    return app if app

    Integration.create!(integration_attributes)
    create_integration_triggers
    app
  end

  def create_integration_triggers
    return unless app

    IntegrationInstallTrigger.where(integration: app).delete_all
    IntegrationInstallTrigger.create!(file_trigger_attributes)
    IntegrationInstallTrigger.create!(auto_install_trigger_attributes)
  end

  def update_app
    return unless app

    app.update!(integration_attributes)
    update_integration_triggers
    update_installations

    app
  end

  def update_integration_triggers
    return unless app

    [file_trigger_attributes, auto_install_trigger_attributes].each do |trigger_attributes|
      trigger = IntegrationInstallTrigger.latest(integration: app, install_type: trigger_attributes[:install_type])
      if trigger.present?
        trigger.assign_attributes(trigger_attributes)
        trigger.save!
      else
        IntegrationInstallTrigger.create!(trigger_attributes)
      end
    end
  end

  def update_installations
    return unless app

    app.reload
    app.versions.each do |version|
      next if version.number == app.latest_version.number

      UpgradeIntegrationInstallationVersionJob.perform_now \
        app.id,
        version.number,
        app.latest_version.number
    end
  end

  def destroy_app
    IntegrationInstallTrigger.where(integration: app).delete_all
    apps = Integration.where(name: name)
    apps.destroy_all
    GitHub.instance_variable_set :@launch_github_app, nil # Need to clear this so it reloads
  end

  def enable_hooks
    app.update! default_events: [*CheckSuite::ActionsDependency::ACTIONS_WEBHOOK_EVENTS, "repository"], default_permissions: default_permissions
    app.reload
    update_installations
  end

  def disable_hooks
    app.update! default_events: []
    app.reload
    update_installations
  end

  def get_private_key
    key = app.generate_key(creator: owner)
    key.private_key.to_pem
  end

  private

  def app
    GitHub.launch_github_app
  end

  def default_permissions
    Apps::Internal::Actions::PERMISSIONS
  end

  def integration_attributes
    {
      owner: owner,
      name: name,
      url: app_url,
      public: true,
      default_permissions: default_permissions,
      default_events: CheckSuite::ActionsDependency::ACTIONS_WEBHOOK_EVENTS,
      hook_attributes: { url: "#{app_url}/webhook", secret: webhook_secret, active: true },
      skip_restrict_names_with_github_validation: true,
      skip_generate_slug: true,
      no_repo_permissions_allowed: true,
    }
  end

  def owner
    GitHub.trusted_oauth_apps_owner || create_trusted_oauth_apps_owner
  end

  def name
    GitHub.launch_github_app_name
  end

  def webhook_secret
    ENV["RECEIVER_WEBHOOK_SECRET"] || SecureRandom.hex(16)
  end

  def app_url
    ENV["RECEIVER_HTTP_ADDR"] || "http://127.0.0.1:5004"
  end

  def file_trigger_attributes
    {
      install_type: "file_added",
      path: '\A\.github/workflows/[^/]+\.ya?ml\z',
      reason: "",
      deactivated: false,
      integration_id: app.id,
    }
  end

  def auto_install_trigger_attributes
    {
      install_type: "actions_automatic_installation",
      reason: "",
      deactivated: false,
      integration_id: app.id,
    }
  end

  # Duped from Organization.create_trusted_oauth_apps_owner, which is restricted to enterprise only
  def create_trusted_oauth_apps_owner
    Organization.where(login: GitHub.trusted_oauth_apps_org_name).first_or_create(
      login: GitHub.trusted_oauth_apps_org_name,
      plan: GitHub::Plan.find("free").name,
      billing_email: "ghost-org@github.com",
      admins: [User.ghost],
    )
  end
end

if __FILE__ == $0
  CreateLaunchGitHubApp.new.create_app
end
