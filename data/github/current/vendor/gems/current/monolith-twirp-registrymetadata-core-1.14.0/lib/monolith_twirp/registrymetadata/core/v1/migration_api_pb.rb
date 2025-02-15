# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: core/v1/migration_api.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("core/v1/migration_api.proto", :syntax => :proto3) do
    add_message "registrymetadata.core.v1.GetPackageMigrationStatusRequest" do
      optional :repo_name_with_owner, :string, 1
      optional :package_name, :string, 2
    end
    add_message "registrymetadata.core.v1.GetPackageVersionMigrationStatusRequest" do
      optional :repo_name_with_owner, :string, 1
      optional :package_name, :string, 2
      optional :version_sha, :string, 3
      optional :tag_name, :string, 4
      optional :package_type, :string, 5
    end
    add_message "registrymetadata.core.v1.GetPackageVersionMigrationStatusResponse" do
      optional :package_id, :int64, 1
      optional :owner_id, :int64, 2
      optional :repo_id, :int64, 3
      optional :status, :enum, 4, "registrymetadata.core.v1.PackageVersionMigrationStatus"
    end
    add_message "registrymetadata.core.v1.GetPackageMigrationStatusEcoRequest" do
      optional :owner_name, :string, 1
      optional :package_name, :string, 2
      optional :package_type, :string, 3
    end
    add_message "registrymetadata.core.v1.GetPackageMigrationStatusResponse" do
      optional :package_id, :int64, 1
      optional :owner_id, :int64, 2
      optional :repo_id, :int64, 3
      optional :status, :enum, 4, "registrymetadata.core.v1.MigrationStatus"
    end
    add_message "registrymetadata.core.v1.GetPackageMigrationStatusEcoResponse" do
      optional :package_id, :int64, 1
      optional :owner_id, :int64, 2
      optional :status, :enum, 3, "registrymetadata.core.v1.MigrationStatus"
    end
    add_message "registrymetadata.core.v1.GetOwnerMigrationStatusRequest" do
      optional :owner_name, :string, 1
    end
    add_message "registrymetadata.core.v1.GetOwnerMigrationStatusResponse" do
      optional :owner_id, :int64, 1
      optional :status, :enum, 2, "registrymetadata.core.v1.MigrationStatus"
    end
    add_message "registrymetadata.core.v1.GetOwnerMigrationStatusEcoRequest" do
      optional :owner_name, :string, 1
      optional :package_type, :string, 2
      optional :check_new_namespace, :bool, 3
    end
    add_message "registrymetadata.core.v1.GetOwnerMigrationStatusEcoResponse" do
      optional :owner_id, :int64, 1
      optional :status, :enum, 2, "registrymetadata.core.v1.MigrationStatus"
    end
    add_enum "registrymetadata.core.v1.MigrationStatus" do
      value :MIGRATION_STATUS_INVALID, 0
      value :MIGRATION_STATUS_PENDING, 1
      value :MIGRATION_STATUS_COMPLETE, 2
      value :MIGRATION_STATUS_ERROR, 3
    end
    add_enum "registrymetadata.core.v1.PackageVersionMigrationStatus" do
      value :PACKAGE_VERSION_MIGRATION_STATUS_INVALID, 0
      value :PACKAGE_VERSION_MIGRATION_STATUS_UNMIGRATED, 1
      value :PACKAGE_VERSION_MIGRATION_STATUS_PENDING, 2
      value :PACKAGE_VERSION_MIGRATION_STATUS_ERROR, 3
      value :PACKAGE_VERSION_MIGRATION_STATUS_COMPLETE, 4
      value :PACKAGE_VERSION_MIGRATION_STATUS_RETRIABLE_ERROR, 5
    end
  end
end

module MonolithTwirp
  module Registrymetadata
    module Core
      module V1
        GetPackageMigrationStatusRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("registrymetadata.core.v1.GetPackageMigrationStatusRequest").msgclass
        GetPackageVersionMigrationStatusRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("registrymetadata.core.v1.GetPackageVersionMigrationStatusRequest").msgclass
        GetPackageVersionMigrationStatusResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("registrymetadata.core.v1.GetPackageVersionMigrationStatusResponse").msgclass
        GetPackageMigrationStatusEcoRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("registrymetadata.core.v1.GetPackageMigrationStatusEcoRequest").msgclass
        GetPackageMigrationStatusResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("registrymetadata.core.v1.GetPackageMigrationStatusResponse").msgclass
        GetPackageMigrationStatusEcoResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("registrymetadata.core.v1.GetPackageMigrationStatusEcoResponse").msgclass
        GetOwnerMigrationStatusRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("registrymetadata.core.v1.GetOwnerMigrationStatusRequest").msgclass
        GetOwnerMigrationStatusResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("registrymetadata.core.v1.GetOwnerMigrationStatusResponse").msgclass
        GetOwnerMigrationStatusEcoRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("registrymetadata.core.v1.GetOwnerMigrationStatusEcoRequest").msgclass
        GetOwnerMigrationStatusEcoResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("registrymetadata.core.v1.GetOwnerMigrationStatusEcoResponse").msgclass
        MigrationStatus = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("registrymetadata.core.v1.MigrationStatus").enummodule
        PackageVersionMigrationStatus = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("registrymetadata.core.v1.PackageVersionMigrationStatus").enummodule
      end
    end
  end
end
