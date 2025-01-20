#!/usr/bin/env safe-ruby
# typed: true
# frozen_string_literal: true

require_relative "../config/environment"

unless Rails.env.development?
  raise "This is a dev only script"
end

class CreateDependabotGitHubApp
  attr_accessor :integration
  def call
    integration = find_integration_or_create_it
    create_dot_env_file(integration)
    self.integration = integration
  end

  def find_integration_or_create_it
    GitHub.dependabot_github_app || create_integration!
  end

  private

  def create_integration!
    name = GitHub.dependabot_github_app_name
    slug = GitHub.dependabot_github_app_slug
    owner = GitHub.trusted_oauth_apps_owner
    secret = SecureRandom.hex(16)

    Integration.create!(
      owner: owner,
      name: name,
      url: "http://dependabot.localhost:3001",
      default_permissions: Apps::Internal::Dependabot::PERMISSIONS,
      public: false,
      hook_attributes: { url: "http://dependabot.localhost:3001/github_webhooks", secret: secret },
      slug: slug,
      skip_restrict_names_with_github_validation: true,
      skip_generate_slug: true,
      no_repo_permissions_allowed: true,
    )
  end

  def create_dot_env_file(integration)
    File.open(dotenv_path, "w") do |file|
      file.puts "TARGET_GITHUB_URL=\"http://host.docker.internal:3000/\""
      file.puts "GITHUB_INTEGRATION_NAME=\"#{integration.name}\""
      file.puts "GITHUB_INTEGRATION_ID=\"#{integration.id}\""
      file.puts "GITHUB_INTEGRATION_NODE_ID=\"#{integration.global_relay_id}\""
      file.puts "GITHUB_INTEGRATION_NEXT_GLOBAL_ID=\"#{integration.next_global_id}\""
      pem = integration.generate_key(creator: integration.owner).private_key.to_pem
      file.puts "GITHUB_INTEGRATION_PRIVATE_KEY=\"#{pem}\""
      file.puts "GITHUB_INTEGRATION_WEBHOOK_SECRET=\"#{integration.hook.secret}\""
      file.puts "GITHUB_ORG_ID=\"#{GitHub.trusted_oauth_apps_owner.id}\""
    end
  end

  def dotenv_path
    dotenv_path = if File.exist?(dependabot_api_path)
      "#{dependabot_api_path}/#{dotenv_filename}"
    else
      "tmp/dependabot#{dotenv_filename}"
    end

    puts "Saving Dependabot envvars to `#{dotenv_path}`"
    dotenv_path
  end

  def dependabot_api_path
    ENV["DEPENDABOT_API_PATH"] || Rails.root.join("..", "dependabot-api")
  end

  def dotenv_filename
    ".env.local"
  end
end

class CreateIntegrationTrigger
  def call
    Integration.transaction do
      app_creator = CreateDependabotGitHubApp.new
      app_creator.call

      Apps::Internal::Dependabot.create_integration_trigger(app_creator.integration)
    end
  end
end

if __FILE__ == $0
  CreateIntegrationTrigger.new.call
  puts "Integration and install triggers created!"
end
