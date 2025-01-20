# typed: true
# frozen_string_literal: true

namespace :enterprise do
  namespace :chatops do
    task :create_msteams , [:app_url, :webhook_url, :callback_url, :webhook_secret, :insecure_webhook, :client_key, :client_secret, :public_key_file] => [:environment] do |_t, args|
      return unless GitHub.enterprise?
      public_key = File.read(args[:public_key_file])

      Apps::Internal::Msteams.seed_database!(
        app_url: args[:app_url],
        webhook_url: args[:webhook_url],
        callback_url: args[:callback_url],
        webhook_secret: args[:webhook_secret],
        insecure_ssl: args[:insecure_webhook],
        client_key: args[:client_key],
        client_secret: args[:client_secret],
        public_key: public_key)
    end

    task :update_msteams , [:app_url, :webhook_url, :callback_url, :webhook_secret, :insecure_webhook, :client_key, :client_secret, :public_key_file] => [:environment] do |_t, args|
      return unless GitHub.enterprise?
      public_key = File.read(args[:public_key_file])

      Apps::Internal::Msteams.update_app!(
        app_url: args[:app_url],
        webhook_url: args[:webhook_url],
        callback_url: args[:callback_url],
        webhook_secret: args[:webhook_secret],
        insecure_ssl: args[:insecure_webhook],
        client_key: args[:client_key],
        client_secret: args[:client_secret],
        public_key: public_key)
    end

    task :delete_msteams , [] => [:environment] do |_t, _args|
      return unless GitHub.enterprise?
      Apps::Internal::Msteams.delete_app!
    end

    task :create_slack , [:app_url, :webhook_url, :callback_url, :webhook_secret, :insecure_webhook, :client_key, :client_secret, :public_key_file] => [:environment] do |_t, args|
      return unless GitHub.enterprise?
      public_key = File.read(args[:public_key_file])

      Apps::Internal::Slack.seed_database!(
        app_url: args[:app_url],
        webhook_url: args[:webhook_url],
        callback_url: args[:callback_url],
        webhook_secret: args[:webhook_secret],
        insecure_ssl: args[:insecure_webhook],
        client_key: args[:client_key],
        client_secret: args[:client_secret],
        public_key: public_key,
        skip_slug_owner_check: true)
    end

    task :update_slack , [:app_url, :webhook_url, :callback_url, :webhook_secret, :insecure_webhook, :client_key, :client_secret, :public_key_file] => [:environment] do |_t, args|
      return unless GitHub.enterprise?
      public_key = File.read(args[:public_key_file])

      Apps::Internal::Slack.update_app!(
        app_url: args[:app_url],
        webhook_url: args[:webhook_url],
        callback_url: args[:callback_url],
        webhook_secret: args[:webhook_secret],
        insecure_ssl: args[:insecure_webhook],
        client_key: args[:client_key],
        client_secret: args[:client_secret],
        public_key: public_key)
    end

    task :delete_slack , [] => [:environment] do |_t, _args|
      return unless GitHub.enterprise?
      Apps::Internal::Slack.delete_app!
    end
  end
end
