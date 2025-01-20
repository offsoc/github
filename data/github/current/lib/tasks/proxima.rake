# typed: false # rubocop:disable Sorbet/TrueSigil
# frozen_string_literal: true

namespace :proxima do
  namespace :app_sync do
    task :add_public_key, [:app_alias, :public_key_file] => [:environment] do |_t, args|
      next unless GitHub.multi_tenant_enterprise?

      app_alias = args[:app_alias]
      app = Apps::Internal.integration(app_alias.to_sym)

      raise "App #{app_alias} not found" unless app.present?

      raise "App #{app_alias} does not have proxima_first_party_sync capability" unless Apps::Internal.capable?(:proxima_first_party_sync, app: app)

      raise "App #{app_alias} does not have feature flag proxima_app_synchronizations enabled" unless app.feature_enabled?(:proxima_app_synchronizations)

      public_key_file = args[:public_key_file]

      public_pem = if public_key_file.present?
        File.read(public_key_file)
      end

      if public_pem.present?
        app.public_keys.create!(creator: app.owner, skip_generate_key: true, public_pem: public_pem)
        GitHub.dogstats.increment("proxima.app_sync.add_public_key", tags: ["generated_private_key:false"])
      else
        private_pem = app.generate_key(creator: app.owner).private_key.to_pem
        puts "GENERATED_PRIVATE_KEY=\"#{private_pem}\""
        GitHub.dogstats.increment("proxima.app_sync.add_public_key", tags: ["generated_private_key:true"])
      end
    end
  end
end
