# frozen_string_literal: true

require "date"

namespace :enterprise do
  namespace :packages do
    task :init_packages_ci, [:login] => [:environment] do |_t, args|
      @access = User.find_by_login(args[:login]).oauth_accesses.build do |access|
        access.application_id = OauthApplication::PERSONAL_TOKENS_APPLICATION_ID
        access.application_type = OauthApplication::PERSONAL_TOKENS_APPLICATION_TYPE
        access.description = "enterprise integration token - #{DateTime.now.strftime('%Q')}"
        access.scopes = [
          "repo",
          "delete_repo",
          "write:packages",
          "delete:packages",
          "site_admin"
        ]
      end
      business = Business.find_by(id: 1)
      user = User.find_by_login(args[:login])
      business.add_owner(user, actor: user)
      token = @access.set_random_token_pair
      @access.save!
      puts token
    end
  end
end

namespace :enterprise do
  namespace :packages do
    task :init_packages_read_only_ci, [:login] => [:environment] do |_t, args|
      @access = User.find_by_login(args[:login]).oauth_accesses.build do |access|
        access.application_id = OauthApplication::PERSONAL_TOKENS_APPLICATION_ID
        access.application_type = OauthApplication::PERSONAL_TOKENS_APPLICATION_TYPE
        access.description = "enterprise integration token read only - #{DateTime.now.strftime('%Q')}"
        access.scopes = [
          "repo",
          "read:packages"
        ]
      end
      token = @access.set_random_token_pair
      @access.save!
      puts token
    end
  end
end

namespace :enterprise do
  namespace :packages do
    task :init_packages_migration_ci, [:namespace] => [:environment] do |_t, args|
      ::Packages::Migration::MigrateNamespaceJob.perform_now(args[:namespace], "docker", force: false, retry_failed: false)
      puts "migration has been triggred for #{args[:namespace]}"
    end
  end
end
