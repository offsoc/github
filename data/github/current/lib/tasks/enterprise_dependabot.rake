# frozen_string_literal: true

namespace :enterprise do
  namespace :dependabot do
    # Create the Dependabot app on an instance of GitHub running inside GHES.
    #
    # This is run when Dependabot is enabled on GHES.
    #
    # rake enterprise:dependabot:create[http://localhost:4006,http://localhost:4006/github_webhooks,secret,true,/path/to/key]
    task :create , [:app_url, :webhook_url, :webhook_secret, :insecure_webhook, :public_key_file] => [:environment] do |_t, args|
      return unless GitHub.enterprise?
      public_key = File.read(args[:public_key_file])

      Apps::Internal::Dependabot.seed_database!(
        app_url: args[:app_url],
        webhook_url: args[:webhook_url],
        webhook_secret: args[:webhook_secret],
        insecure_ssl: args[:insecure_webhook],
        public_key: public_key)
    end

    # Update the Dependabot app on an instance of GitHub running inside GHES.
    #
    # This is run when Dependabot is updated on GHES.
    #
    # rake enterprise:dependabot:update[http://localhost:4006/github_webhooks]
    task :update, [:webhook_url] => [:environment] do |_t, args|
      return unless GitHub.enterprise?

      Apps::Internal::Dependabot.update_app!(webhook_url: args[:webhook_url])
    end
  end
end
