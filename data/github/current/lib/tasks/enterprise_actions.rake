# frozen_string_literal: true

namespace :enterprise do
  namespace :actions do
    task :create , [:app_url, :webhook_url, :webhook_secret, :insecure_webhook, :client_key, :client_secret, :public_key_file] => [:environment] do |_t, args|
      next unless GitHub.single_or_multi_tenant_enterprise?
      public_key = ENV["LAUNCH_APP_PUBLIC_KEY"] || File.read(args[:public_key_file])

      Apps::Internal::Actions.seed_database!(
        app_url: args[:app_url],
        webhook_url: args[:webhook_url],
        webhook_secret: args[:webhook_secret],
        insecure_ssl: args[:insecure_webhook],
        client_key: args[:client_key],
        client_secret: args[:client_secret],
        public_key: public_key)
    end

    task :update , [:webhook_secret, :client_key, :client_secret] => [:environment] do |_t, args|
      next unless GitHub.single_or_multi_tenant_enterprise?

      Apps::Internal::Actions.update_app!(
        webhook_secret: args[:webhook_secret],
        client_key: args[:client_key],
        client_secret: args[:client_secret])
    end

    task :create_or_update, [:app_url, :webhook_url, :webhook_secret, :insecure_webhook, :client_key, :client_secret, :public_key_file] => [:environment] do |_t, args|
      next unless GitHub.single_or_multi_tenant_enterprise?

      integration = Integration.find_by(owner_id: GitHub.trusted_apps_owner_id, name: GitHub.launch_github_app_name)

      if integration.nil?
        Rake::Task[:"enterprise:actions:create"].invoke(
          args[:app_url],
          args[:webhook_url],
          args[:webhook_secret],
          args[:insecure_webhook],
          args[:client_key],
          args[:client_secret],
          args[:public_key_file])
      else
        Rake::Task[:"enterprise:actions:update"].invoke(
          args[:webhook_secret],
          args[:client_key],
          args[:client_secret]
        )
      end
    end

    task :set_actions_packages_setup_pending => [:environment] do
      GitHub.kv.set("ghes.actions_packages_setup_pending", "true")
    end
  end
end
