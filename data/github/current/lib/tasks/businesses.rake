# frozen_string_literal: true

require "github/enterprise"

desc "creates GitHub.global_business on Enterprise Server"
namespace :business do
  task :create do
    next if GitHub.multi_tenant_enterprise?
    fail "May only be run in the Enterprise Server environment." unless GitHub.single_business_environment?

    GitHub::Enterprise.ensure_business!
    GitHub::Enterprise.ensure_customer!
  end

  task :disable_scim => :environment do
    next if GitHub.multi_tenant_enterprise?
    fail "May only be run in the Enterprise Server environment." unless GitHub.single_business_environment?

    GitHub::Enterprise.disable_scim!
  end
end
