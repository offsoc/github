# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: migrations/v1/org_migration.proto

require 'google/protobuf'

require 'google/protobuf/timestamp_pb'
require 'google/protobuf/wrappers_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("migrations/v1/org_migration.proto", :syntax => :proto3) do
    add_message "octoshift.migrations.v1.OrgMigration" do
      optional :id, :string, 1
      optional :source_org_url, :string, 2
      optional :target_org_name, :string, 3
      optional :migration_state, :enum, 4, "octoshift.migrations.v1.OrgMigrationState"
      optional :source_org_name, :string, 5
      optional :created_at, :message, 6, "google.protobuf.Timestamp"
      optional :target_enterprise_id, :int64, 7
      optional :failure_reason, :string, 8
      optional :remaining_repositories_count, :message, 9, "google.protobuf.Int64Value"
      optional :total_repositories_count, :message, 10, "google.protobuf.Int64Value"
    end
    add_enum "octoshift.migrations.v1.OrgMigrationState" do
      value :ORG_MIGRATION_STATE_INVALID, 0
      value :ORG_MIGRATION_STATE_NOT_STARTED, 5
      value :ORG_MIGRATION_STATE_QUEUED, 10
      value :ORG_MIGRATION_STATE_PRE_REPO_MIGRATION, 15
      value :ORG_MIGRATION_STATE_REPO_MIGRATION, 20
      value :ORG_MIGRATION_STATE_POST_REPO_MIGRATION, 25
      value :ORG_MIGRATION_STATE_IN_PROGRESS, 30
      value :ORG_MIGRATION_STATE_FAILED, 35
      value :ORG_MIGRATION_STATE_SUCCEEDED, 40
      value :ORG_MIGRATION_STATE_PENDING_VALIDATION, 45
      value :ORG_MIGRATION_STATE_FAILED_VALIDATION, 50
    end
  end
end

module MonolithTwirp
  module Octoshift
    module Migrations
      module V1
        OrgMigration = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.migrations.v1.OrgMigration").msgclass
        OrgMigrationState = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.migrations.v1.OrgMigrationState").enummodule
      end
    end
  end
end
