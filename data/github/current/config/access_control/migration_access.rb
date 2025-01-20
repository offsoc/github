# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :import_issue do |access|
    access.ensure_context :repo
    access.allow :repo_administration_writer
  end

  define_access :migration_export do |access|
    access.ensure_context :user, :resource
    access.allow(:user_exporter) { |c| c[:resource].user? }
    access.allow :octoshift_exporter
  end

  define_access :migration_import do |access|
    access.allow :v3_org_admin
  end

  define_access :write_migration do |access|
    access.allow :org_admin
  end

  define_access :migration_repo_unlock do |access|
    access.ensure_context :repo
    access.allow :repo_administration_writer
  end

  define_access :octoshift_import do |access|
    access.allow :octoshift_importer
  end

  define_access :octoshift_enterprise_import do |access|
    access.allow :octoshift_enterprise_importer
  end

  define_access :octoshift_admin do |access|
    access.allow :org_admin
  end
end
