# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: users/v1/copilot_user_detail_api.proto

require 'google/protobuf'

require 'google/protobuf/timestamp_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("users/v1/copilot_user_detail_api.proto", :syntax => :proto3) do
    add_message "copilot.users.v1.GetCopilotUserRequest" do
      optional :id, :uint64, 1
      optional :analytics_tracking_id, :string, 2
    end
    add_message "copilot.users.v1.GetCopilotUserResponse" do
      optional :user_details, :message, 1, "copilot.users.v1.CopilotUserDetails"
    end
    add_message "copilot.users.v1.CopilotUserDetails" do
      optional :id, :uint64, 1
      optional :telemetry_configuration, :enum, 2, "copilot.users.v1.Telemetry"
      optional :snippy_setting, :enum, 3, "copilot.users.v1.Snippy"
      optional :editor_chat_setting, :enum, 4, "copilot.users.v1.EditorChat"
      optional :copilot_access_type, :enum, 5, "copilot.users.v1.AccessType"
      optional :has_cfb_access, :bool, 6
      optional :has_cfi_access, :bool, 7
      optional :has_paid_access, :bool, 8
      optional :has_free_access, :bool, 9
      optional :latest_usage_detail, :message, 10, "google.protobuf.Timestamp"
      optional :latest_usage_detail_editor, :string, 11
      optional :dotcom_chat_setting, :enum, 12, "copilot.users.v1.DotcomChat"
      optional :cli_setting, :enum, 13, "copilot.users.v1.CLI"
      optional :spammy, :bool, 14
      optional :administrative_blocked, :bool, 15
      optional :copilot_plan, :enum, 16, "copilot.users.v1.CopilotPlan"
      optional :mobile_chat_setting, :enum, 17, "copilot.users.v1.MobileChat"
      repeated :copilot_organization_ids, :uint64, 18
      optional :bing_setting, :enum, 19, "copilot.users.v1.Bing"
      optional :custom_model, :enum, 20, "copilot.users.v1.CustomModel"
      optional :pr_summarization, :enum, 21, "copilot.users.v1.PRSummarization"
      optional :private_docs, :enum, 22, "copilot.users.v1.PrivateDocs"
      optional :analytics_tracking_id, :string, 23
      optional :trust_tier, :enum, 24, "copilot.users.v1.TrustTier"
      repeated :copilot_organizations, :message, 25, "copilot.users.v1.CopilotOrganization"
      repeated :adminable_organizations, :message, 26, "copilot.users.v1.CopilotOrganization"
      optional :skuisolation, :message, 27, "copilot.users.v1.SKUIsolation"
      optional :has_cfe_access, :bool, 28
      optional :copilot_telemetry_snapshot_id, :string, 29
      optional :copilot_beta_features_opt_in_setting, :enum, 30, "copilot.users.v1.CopilotBetaFeaturesOptIn"
      optional :content_exclusion_enabled, :bool, 31
    end
    add_message "copilot.users.v1.CopilotOrganization" do
      optional :id, :uint64, 1
      optional :analytics_tracking_id, :string, 2
    end
    add_message "copilot.users.v1.SKUIsolation" do
      optional :api_host, :string, 1
    end
    add_message "copilot.users.v1.BulkUserLookupRequest" do
      repeated :analytics_tracking_ids, :string, 1
    end
    add_message "copilot.users.v1.BulkUserDetail" do
      optional :id, :uint64, 1
      optional :analytics_tracking_id, :string, 2
      repeated :copilot_organizations, :message, 3, "copilot.users.v1.CopilotOrganization"
    end
    add_message "copilot.users.v1.BulkUserLookupResponse" do
      repeated :bulk_user_details, :message, 1, "copilot.users.v1.BulkUserDetail"
    end
    add_enum "copilot.users.v1.Telemetry" do
      value :TELEMETRY_INVALID, 0
      value :TELEMETRY_ENABLED, 1
      value :TELEMETRY_DISABLED, 2
    end
    add_enum "copilot.users.v1.Snippy" do
      value :SNIPPY_INVALID, 0
      value :SNIPPY_ENABLED, 1
      value :SNIPPY_DISABLED, 2
      value :SNIPPY_UNCONFIGURED, 3
      value :SNIPPY_NO_POLICY, 4
    end
    add_enum "copilot.users.v1.EditorChat" do
      value :EDITOR_CHAT_INVALID, 0
      value :EDITOR_CHAT_ENABLED, 1
      value :EDITOR_CHAT_DISABLED, 2
      value :EDITOR_CHAT_UNCONFIGURED, 3
      value :EDITOR_CHAT_NO_POLICY, 4
    end
    add_enum "copilot.users.v1.DotcomChat" do
      value :DOTCOM_CHAT_INVALID, 0
      value :DOTCOM_CHAT_ENABLED, 1
      value :DOTCOM_CHAT_DISABLED, 2
      value :DOTCOM_CHAT_UNCONFIGURED, 3
    end
    add_enum "copilot.users.v1.Bing" do
      value :BING_INVALID, 0
      value :BING_ENABLED, 1
      value :BING_DISABLED, 2
      value :BING_UNCONFIGURED, 3
    end
    add_enum "copilot.users.v1.CopilotBetaFeaturesOptIn" do
      value :COPILOT_BETA_FEATURES_OPT_IN_INVALID, 0
      value :COPILOT_BETA_FEATURES_OPT_IN_ENABLED, 1
      value :COPILOT_BETA_FEATURES_OPT_IN_DISABLED, 2
      value :COPILOT_BETA_FEATURES_OPT_IN_UNCONFIGURED, 3
    end
    add_enum "copilot.users.v1.CLI" do
      value :CLI_INVALID, 0
      value :CLI_ENABLED, 1
      value :CLI_DISABLED, 2
      value :CLI_UNCONFIGURED, 3
    end
    add_enum "copilot.users.v1.TrustTier" do
      value :TRUST_TIER_INVALID, 0
      value :TRUST_TIER_UNTRUSTED, 1
      value :TRUST_TIER_NEUTRAL, 2
      value :TRUST_TIER_TRUSTED, 3
    end
    add_enum "copilot.users.v1.AccessType" do
      value :ACCESS_TYPE_INVALID, 0
      value :ACCESS_TYPE_TRIAL_MONTHLY_SUBSCRIBER, 1
      value :ACCESS_TYPE_TRIAL_YEARLY_SUBSCRIBER, 2
      value :ACCESS_TYPE_MONTHLY_SUBSCRIBER, 3
      value :ACCESS_TYPE_YEARLY_SUBSCRIBER, 4
      value :ACCESS_TYPE_FREE_ENGAGED_OSS, 5
      value :ACCESS_TYPE_FREE_EDUCATIONAL, 6
      value :ACCESS_TYPE_FREE_ENTERPRISE, 7
      value :ACCESS_TYPE_FREE_ENTERPRISE_TRIAL, 8
      value :ACCESS_TYPE_FREE_GITHUB_STAR, 16
      value :ACCESS_TYPE_FREE_MS_MVP, 17
      value :ACCESS_TYPE_FREE_Y_COMBINATOR, 18
      value :ACCESS_TYPE_FREE_FACULTY, 19
      value :ACCESS_TYPE_OTHER_FREE_ACCESS, 20
      value :ACCESS_TYPE_COMPLIMENTARY_ACCESS, 21
      value :ACCESS_TYPE_TECHNICAL_PREVIEW_EXTENSION, 22
      value :ACCESS_TYPE_PARTNER_ACCESS, 23
      value :ACCESS_TYPE_COPILOT_FOR_BUSINESS_SEAT, 24
      value :ACCESS_TYPE_COPILOT_FOR_BUSINESS_SEAT_ASSIGNMENT, 25
      value :ACCESS_TYPE_HEY_GITHUB, 26
      value :ACCESS_TYPE_COPILOT_FOR_BUSINESS_TRIAL_SEAT, 27
      value :ACCESS_TYPE_TRIAL_30_MONTHLY_SUBSCRIBER, 28
      value :ACCESS_TYPE_TRIAL_30_YEARLY_SUBSCRIBER, 29
      value :ACCESS_TYPE_CODESPACES_DEMO, 31
      value :ACCESS_TYPE_WORKSHOP, 32
      value :ACCESS_TYPE_COPILOT_ENTERPRISE_SEAT, 33
      value :ACCESS_TYPE_COPILOT_ENTERPRISE_SEAT_ASSIGNMENT, 34
      value :ACCESS_TYPE_COPILOT_ENTERPRISE_TRIAL_SEAT, 35
      value :ACCESS_TYPE_COPILOT_STANDALONE_SEAT, 36
      value :ACCESS_TYPE_COPILOT_STANDALONE_SEAT_ASSIGNMENT, 37
      value :ACCESS_TYPE_COPILOT_STANDALONE_TRIAL_SEAT, 38
    end
    add_enum "copilot.users.v1.CopilotPlan" do
      value :COPILOT_PLAN_INVALID, 0
      value :COPILOT_PLAN_INDIVIDUAL, 1
      value :COPILOT_PLAN_BUSINESS, 2
      value :COPILOT_PLAN_ENTERPRISE, 3
    end
    add_enum "copilot.users.v1.MobileChat" do
      value :MOBILE_CHAT_INVALID, 0
      value :MOBILE_CHAT_ENABLED, 1
      value :MOBILE_CHAT_DISABLED, 2
      value :MOBILE_CHAT_UNCONFIGURED, 3
    end
    add_enum "copilot.users.v1.CustomModel" do
      value :CUSTOM_MODEL_INVALID, 0
      value :CUSTOM_MODEL_ENABLED, 1
      value :CUSTOM_MODEL_DISABLED, 2
      value :CUSTOM_MODEL_UNCONFIGURED, 3
      value :CUSTOM_MODEL_NO_POLICY, 4
    end
    add_enum "copilot.users.v1.PRSummarization" do
      value :PR_SUMMARIZATION_INVALID, 0
      value :PR_SUMMARIZATION_ENABLED, 1
      value :PR_SUMMARIZATION_DISABLED, 2
      value :PR_SUMMARIZATION_UNCONFIGURED, 3
      value :PR_SUMMARIZATION_NO_POLICY, 4
    end
    add_enum "copilot.users.v1.PrivateDocs" do
      value :PRIVATE_DOCS_INVALID, 0
      value :PRIVATE_DOCS_ENABLED, 1
      value :PRIVATE_DOCS_DISABLED, 2
      value :PRIVATE_DOCS_UNCONFIGURED, 3
      value :PRIVATE_DOCS_NO_POLICY, 4
    end
  end
end

module MonolithTwirp
  module Copilot
    module Users
      module V1
        GetCopilotUserRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.GetCopilotUserRequest").msgclass
        GetCopilotUserResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.GetCopilotUserResponse").msgclass
        CopilotUserDetails = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.CopilotUserDetails").msgclass
        CopilotOrganization = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.CopilotOrganization").msgclass
        SKUIsolation = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.SKUIsolation").msgclass
        BulkUserLookupRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.BulkUserLookupRequest").msgclass
        BulkUserDetail = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.BulkUserDetail").msgclass
        BulkUserLookupResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.BulkUserLookupResponse").msgclass
        Telemetry = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.Telemetry").enummodule
        Snippy = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.Snippy").enummodule
        EditorChat = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.EditorChat").enummodule
        DotcomChat = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.DotcomChat").enummodule
        Bing = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.Bing").enummodule
        CopilotBetaFeaturesOptIn = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.CopilotBetaFeaturesOptIn").enummodule
        CLI = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.CLI").enummodule
        TrustTier = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.TrustTier").enummodule
        AccessType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.AccessType").enummodule
        CopilotPlan = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.CopilotPlan").enummodule
        MobileChat = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.MobileChat").enummodule
        CustomModel = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.CustomModel").enummodule
        PRSummarization = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.PRSummarization").enummodule
        PrivateDocs = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("copilot.users.v1.PrivateDocs").enummodule
      end
    end
  end
end
