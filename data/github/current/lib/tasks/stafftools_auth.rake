# frozen_string_literal: true

namespace :stafftools_auth do
  task set_up_roles_for_dev: :environment do
    if GitHub.enterprise?
      puts "RBAC not in use in enterprise, aborting."
      next
    end

    unless Rails.env.development?
      puts "Please don't reset the roles in production."
      next
    end

    StafftoolsRole.connection.execute <<-SQL
      REPLACE INTO stafftools_roles (`id`, `name`, `created_at`, `updated_at`)
      VALUES (1, "developer",    NOW(), NOW()),
             (2, "read-only",    NOW(), NOW()),
             (3, "super-admin",  NOW(), NOW()),
             (4, "support",      NOW(), NOW())
    SQL

    super_admin = StafftoolsRole.where(name: "super-admin").first

    User.where(gh_role: "staff").find_each do |user|
      next unless user.site_admin?

      user.stafftools_roles.delete_all
      user.stafftools_roles << super_admin
    end
  end
end
