# frozen_string_literal: true

namespace :enterprise do
  namespace :code_scanning do
    task :create, [] => [:environment] do
      next unless GitHub.single_or_multi_tenant_enterprise? || Rails.env.development?
      Apps::Internal::CodeScanning.seed_database!
    end

    task :update, [] => [:environment] do
      next unless GitHub.single_or_multi_tenant_enterprise? || Rails.env.development?

      Apps::Internal::CodeScanning.update_app!
    end

    task :upsert, [] => [:environment] do
      next unless GitHub.single_or_multi_tenant_enterprise? || Rails.env.development?

      app = Apps::Internal.integration(:code_scanning)
      if app.present?
        Apps::Internal::CodeScanning.update_app!
      else
        Apps::Internal::CodeScanning.seed_database!
      end
    end
  end
end
