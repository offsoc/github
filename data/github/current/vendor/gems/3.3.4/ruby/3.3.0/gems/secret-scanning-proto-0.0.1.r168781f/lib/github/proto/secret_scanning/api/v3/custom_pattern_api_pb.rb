# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: api/v3/custom_pattern_api.proto

require 'google/protobuf'

require 'google/protobuf/timestamp_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("api/v3/custom_pattern_api.proto", :syntax => :proto3) do
    add_message "github.secretscanning.v3.CustomPatternIdsSelector" do
      repeated :ids, :uint64, 1
    end
    add_message "github.secretscanning.v3.CustomPatternOrgSelector" do
      optional :owner_id, :uint64, 1
    end
    add_message "github.secretscanning.v3.CustomPatternRepoSelector" do
      optional :repository_id, :uint64, 1
    end
    add_message "github.secretscanning.v3.CustomPatternScanSelector" do
      optional :repository_id, :uint64, 1
      optional :owner_id, :uint64, 2
      optional :business_id, :uint64, 3
    end
    add_message "github.secretscanning.v3.CustomPatternBusinessSelector" do
      optional :business_id, :uint64, 1
    end
    add_message "github.secretscanning.v3.CustomPatternSelector" do
      oneof :selector do
        optional :ids_selector, :message, 1, "github.secretscanning.v3.CustomPatternIdsSelector"
        optional :org_selector, :message, 2, "github.secretscanning.v3.CustomPatternOrgSelector"
        optional :repo_selector, :message, 3, "github.secretscanning.v3.CustomPatternRepoSelector"
        optional :scan_selector, :message, 4, "github.secretscanning.v3.CustomPatternScanSelector"
        optional :business_selector, :message, 5, "github.secretscanning.v3.CustomPatternBusinessSelector"
      end
    end
    add_message "github.secretscanning.v3.GetCustomPatternsRequest" do
      optional :selector, :message, 1, "github.secretscanning.v3.CustomPatternSelector"
      repeated :included_states, :enum, 2, "github.secretscanning.v3.CustomPatternState"
      optional :cursor, :bytes, 3
      optional :sort_order, :enum, 4, "github.secretscanning.v3.SortOrder"
      optional :filter, :message, 5, "github.secretscanning.v3.CustomPatternsFilter"
    end
    add_message "github.secretscanning.v3.CustomPatternsFilter" do
      repeated :included_states, :enum, 1, "github.secretscanning.v3.CustomPatternState"
      optional :push_protected_filter, :enum, 2, "github.secretscanning.v3.PushProtectedFilter"
    end
    add_message "github.secretscanning.v3.GetCustomPatternsCountRequest" do
      optional :selector, :message, 1, "github.secretscanning.v3.CustomPatternSelector"
      repeated :included_states, :enum, 2, "github.secretscanning.v3.CustomPatternState"
      optional :filter, :message, 3, "github.secretscanning.v3.CustomPatternsFilter"
    end
    add_message "github.secretscanning.v3.GetCustomPatternsCountResponse" do
      optional :total_result_count, :uint64, 1
    end
    add_message "github.secretscanning.v3.UpdateCustomPatternSettingsRequest" do
      optional :id, :uint64, 1
      optional :owner_id, :uint64, 2
      optional :owner_scope, :enum, 3, "github.secretscanning.v3.OwnerScope"
      optional :row_version, :string, 4
      optional :updated_by_id, :uint64, 5
      optional :push_protection_enabled, :bool, 6
    end
    add_message "github.secretscanning.v3.UpdateCustomPatternSettingsResponse" do
    end
    add_message "github.secretscanning.v3.DeleteCustomPatternsRequest" do
      repeated :to_delete, :message, 1, "github.secretscanning.v3.DeleteCustomPatternsRequest.CustomPatternIDWithVersion"
      optional :owner_id, :uint64, 2
      optional :owner_scope, :enum, 3, "github.secretscanning.v3.OwnerScope"
      optional :deleted_by_id, :uint64, 4
      optional :post_delete_action, :enum, 5, "github.secretscanning.v3.PostUpdateCustomPatternAction"
    end
    add_message "github.secretscanning.v3.DeleteCustomPatternsRequest.CustomPatternIDWithVersion" do
      optional :id, :uint64, 1
      optional :row_version, :string, 2
    end
    add_message "github.secretscanning.v3.DeleteCustomPatternsResponse" do
    end
    add_message "github.secretscanning.v3.GetGeneratedExpressionsRequest" do
      optional :description, :string, 1
      optional :examples, :string, 2
      optional :user_id, :uint64, 3
    end
    add_message "github.secretscanning.v3.GetGeneratedExpressionsResponse" do
      repeated :generated_expressions, :message, 1, "github.secretscanning.v3.GeneratedExpression"
    end
    add_message "github.secretscanning.v3.GeneratedExpression" do
      optional :regex, :string, 1
      optional :explanation, :string, 2
    end
    add_message "github.secretscanning.v3.CustomPatternBusinessScope" do
      optional :business_id, :uint64, 1
    end
    add_message "github.secretscanning.v3.CustomPatternOrgScope" do
      optional :owner_id, :uint64, 1
    end
    add_message "github.secretscanning.v3.CustomPatternRepoScope" do
      optional :repository_id, :uint64, 1
    end
    add_message "github.secretscanning.v3.PostProcessing" do
      optional :start_delimiter, :string, 1
      optional :end_delimiter, :string, 2
      repeated :must_match, :string, 3
      repeated :must_not_match, :string, 4
    end
    add_message "github.secretscanning.v3.SecretScanCustomPattern" do
      optional :secret_type, :string, 3
      optional :expression, :string, 4
      optional :display_name, :string, 5
      optional :slug, :string, 6
      optional :post_processing, :message, 8, "github.secretscanning.v3.PostProcessing"
      optional :created_at, :message, 9, "google.protobuf.Timestamp"
      optional :updated_at, :message, 10, "google.protobuf.Timestamp"
      optional :id, :uint64, 11
      optional :created_by_id, :uint64, 12
      optional :state, :enum, 13, "github.secretscanning.v3.CustomPatternState"
      optional :updated_by_id, :uint64, 15
      repeated :dry_run_repositories, :uint64, 16
      optional :row_version, :string, 17
      optional :push_protection_enabled, :bool, 18
      oneof :scope do
        optional :org_scope, :message, 1, "github.secretscanning.v3.CustomPatternOrgScope"
        optional :repo_scope, :message, 2, "github.secretscanning.v3.CustomPatternRepoScope"
        optional :business_scope, :message, 14, "github.secretscanning.v3.CustomPatternBusinessScope"
      end
    end
    add_message "github.secretscanning.v3.GetCustomPatternsResponse" do
      repeated :custom_patterns, :message, 1, "github.secretscanning.v3.SecretScanCustomPattern"
      optional :previous_cursor, :bytes, 2
      optional :next_cursor, :bytes, 3
    end
    add_enum "github.secretscanning.v3.CustomPatternState" do
      value :PUBLISHED, 0
      value :DELETED, 1
      value :DISABLED, 2
      value :UNPUBLISHED, 3
    end
    add_enum "github.secretscanning.v3.SortOrder" do
      value :NO_SORT_ORDER, 0
      value :CREATED_ASCENDING, 1
      value :CREATED_DESCENDING, 2
      value :UPDATED_ASCENDING, 3
      value :UPDATED_DESCENDING, 4
      value :NAME_ASCENDING, 5
      value :NAME_DESCENDING, 6
    end
    add_enum "github.secretscanning.v3.PushProtectedFilter" do
      value :INCLUDE_ALL, 0
      value :PUSH_PROTECTED, 1
      value :NOT_PUSH_PROTECTED, 2
    end
    add_enum "github.secretscanning.v3.PostUpdateCustomPatternAction" do
      value :UNKNOWN, 0
      value :RESOLVE_ALERTS, 1
      value :DELETE_ALERTS, 2
    end
    add_enum "github.secretscanning.v3.OwnerScope" do
      value :UNKNOWN_SCOPE, 0
      value :REPOSITORY_SCOPE, 1
      value :ORGANIZATION_SCOPE, 2
      value :BUSINESS_SCOPE, 3
    end
  end
end

module GitHub
  module Proto
    module SecretScanning
      module Api
        module V3
          CustomPatternIdsSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.CustomPatternIdsSelector").msgclass
          CustomPatternOrgSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.CustomPatternOrgSelector").msgclass
          CustomPatternRepoSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.CustomPatternRepoSelector").msgclass
          CustomPatternScanSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.CustomPatternScanSelector").msgclass
          CustomPatternBusinessSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.CustomPatternBusinessSelector").msgclass
          CustomPatternSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.CustomPatternSelector").msgclass
          GetCustomPatternsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.GetCustomPatternsRequest").msgclass
          CustomPatternsFilter = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.CustomPatternsFilter").msgclass
          GetCustomPatternsCountRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.GetCustomPatternsCountRequest").msgclass
          GetCustomPatternsCountResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.GetCustomPatternsCountResponse").msgclass
          UpdateCustomPatternSettingsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.UpdateCustomPatternSettingsRequest").msgclass
          UpdateCustomPatternSettingsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.UpdateCustomPatternSettingsResponse").msgclass
          DeleteCustomPatternsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.DeleteCustomPatternsRequest").msgclass
          DeleteCustomPatternsRequest::CustomPatternIDWithVersion = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.DeleteCustomPatternsRequest.CustomPatternIDWithVersion").msgclass
          DeleteCustomPatternsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.DeleteCustomPatternsResponse").msgclass
          GetGeneratedExpressionsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.GetGeneratedExpressionsRequest").msgclass
          GetGeneratedExpressionsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.GetGeneratedExpressionsResponse").msgclass
          GeneratedExpression = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.GeneratedExpression").msgclass
          CustomPatternBusinessScope = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.CustomPatternBusinessScope").msgclass
          CustomPatternOrgScope = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.CustomPatternOrgScope").msgclass
          CustomPatternRepoScope = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.CustomPatternRepoScope").msgclass
          PostProcessing = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.PostProcessing").msgclass
          SecretScanCustomPattern = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.SecretScanCustomPattern").msgclass
          GetCustomPatternsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.GetCustomPatternsResponse").msgclass
          CustomPatternState = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.CustomPatternState").enummodule
          SortOrder = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.SortOrder").enummodule
          PushProtectedFilter = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.PushProtectedFilter").enummodule
          PostUpdateCustomPatternAction = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.PostUpdateCustomPatternAction").enummodule
          OwnerScope = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v3.OwnerScope").enummodule
        end
      end
    end
  end
end
