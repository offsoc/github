# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: migrations/v1/gsm_migration_api.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("migrations/v1/gsm_migration_api.proto", :syntax => :proto3) do
    add_message "git_src_migrator.migrations.v1.Migration" do
      optional :id, :int64, 1
      optional :state, :enum, 2, "git_src_migrator.migrations.v1.MigrationState"
      optional :actions_logs, :string, 3
      optional :actions_run_url, :string, 4
      optional :failure_reason, :string, 5
      repeated :error_details, :string, 6
    end
    add_message "git_src_migrator.migrations.v1.StartMigrationRequest" do
      optional :source_url, :string, 1
      optional :source_type, :enum, 2, "git_src_migrator.migrations.v1.SourceType"
      optional :source_access_token, :string, 3
      optional :git_archive_url, :string, 4
      optional :repository_id, :int64, 5
      optional :target_owner_id, :int64, 6
      optional :target_ssh_url, :string, 7
      optional :target_wiki_ssh_url, :string, 8
      repeated :tags, :string, 9
      optional :source_username, :string, 10
      optional :user_id, :int64, 11
    end
    add_message "git_src_migrator.migrations.v1.StartMigrationResponse" do
      optional :migration, :message, 1, "git_src_migrator.migrations.v1.Migration"
    end
    add_message "git_src_migrator.migrations.v1.GetMigrationRequest" do
      optional :id, :int64, 1
      optional :repository_id, :int64, 2
    end
    add_message "git_src_migrator.migrations.v1.GetMigrationResponse" do
      optional :migration, :message, 1, "git_src_migrator.migrations.v1.Migration"
    end
    add_enum "git_src_migrator.migrations.v1.SourceType" do
      value :SOURCE_TYPE_INVALID, 0
      value :SOURCE_TYPE_GITHUB, 1
      value :SOURCE_TYPE_AZURE_DEVOPS, 2
      value :SOURCE_TYPE_BITBUCKET_SERVER, 3
      value :SOURCE_TYPE_SOURCE_IMPORT, 4
    end
    add_enum "git_src_migrator.migrations.v1.MigrationState" do
      value :MIGRATION_STATE_INVALID, 0
      value :MIGRATION_STATE_PENDING, 5
      value :MIGRATION_STATE_IN_PROGRESS, 10
      value :MIGRATION_STATE_SUCCEEDED, 15
      value :MIGRATION_STATE_FAILED, 20
      value :MIGRATION_STATE_FAILED_VALIDATION, 25
    end
  end
end

module MonolithTwirp
  module GitSrcMigrator
    module Migrations
      module V1
        Migration = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_src_migrator.migrations.v1.Migration").msgclass
        StartMigrationRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_src_migrator.migrations.v1.StartMigrationRequest").msgclass
        StartMigrationResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_src_migrator.migrations.v1.StartMigrationResponse").msgclass
        GetMigrationRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_src_migrator.migrations.v1.GetMigrationRequest").msgclass
        GetMigrationResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_src_migrator.migrations.v1.GetMigrationResponse").msgclass
        SourceType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_src_migrator.migrations.v1.SourceType").enummodule
        MigrationState = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_src_migrator.migrations.v1.MigrationState").enummodule
      end
    end
  end
end
