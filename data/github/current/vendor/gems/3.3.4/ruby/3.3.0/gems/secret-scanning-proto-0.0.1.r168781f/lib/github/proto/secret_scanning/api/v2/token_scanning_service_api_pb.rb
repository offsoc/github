# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: api/v2/token_scanning_service_api.proto

require 'google/protobuf'

require 'api/v1/shared_pb'
require 'api/v2/custom_pattern_api_pb'
require 'google/protobuf/timestamp_pb'
require 'google/protobuf/empty_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("api/v2/token_scanning_service_api.proto", :syntax => :proto3) do
    add_message "github.secretscanning.v2.GetTimelineRequest" do
      optional :token_alert_number, :uint64, 1
      optional :repository_id, :uint64, 2
    end
    add_message "github.secretscanning.v2.GetTimelineResponse" do
      optional :total_number_of_events, :uint32, 4
      optional :latest_ascending, :message, 5, "github.secretscanning.v2.TimelineSegment"
      optional :earliest_ascending, :message, 6, "github.secretscanning.v2.TimelineSegment"
    end
    add_message "github.secretscanning.v2.TimelineSegment" do
      repeated :events, :message, 1, "github.secretscanning.v2.TimelineEvent"
      optional :cursor, :bytes, 2
    end
    add_message "github.secretscanning.v2.GetMoreTimelineEventsRequest" do
      optional :token_alert_number, :uint64, 1
      optional :repository_id, :uint64, 2
      optional :cursor, :bytes, 3
      optional :number_of_events_to_load, :uint32, 4
    end
    add_message "github.secretscanning.v2.GetMoreTimelineEventsResponse" do
      optional :timeline, :message, 1, "github.secretscanning.v2.TimelineSegment"
    end
    add_message "github.secretscanning.v2.TimelineEvent" do
      optional :type, :enum, 1, "github.secretscanning.v2.TimelineEvent.TimelineEventType"
      optional :time, :message, 2, "google.protobuf.Timestamp"
      optional :actor, :uint64, 3
      oneof :event_specific_data do
        optional :resolution, :message, 4, "github.secretscanning.v2.ResolutionEvent"
        optional :validity, :message, 5, "github.secretscanning.v2.ValidityEvent"
      end
    end
    add_enum "github.secretscanning.v2.TimelineEvent.TimelineEventType" do
      value :UNSPECIFIED, 0
      value :ALERT_CREATION, 1
      value :RESOLUTION, 2
      value :BYPASS, 3
      value :REVOCATION, 4
      value :DELEGATED_BYPASS_REQUEST_OPENED, 5
      value :DELEGATED_BYPASS_REQUEST_APPROVED, 6
      value :VALIDITY_CHANGE, 7
    end
    add_message "github.secretscanning.v2.ValidityEvent" do
      optional :validity, :enum, 1, "github.secretscanning.v2.TokenValidity"
    end
    add_message "github.secretscanning.v2.ResolutionEvent" do
      optional :type, :enum, 1, "github.secretscanning.v2.Token.Resolution"
      optional :resolved, :bool, 2
      optional :resolved_state_change, :bool, 3
      optional :comment, :string, 4
    end
    add_message "github.secretscanning.v2.TokenRemediation" do
      optional :number, :uint64, 1
      optional :event_type, :enum, 2, "github.secretscanning.v2.TokenRemediation.EventType"
      optional :event_at, :message, 3, "google.protobuf.Timestamp"
      optional :event_by, :uint64, 4
    end
    add_enum "github.secretscanning.v2.TokenRemediation.EventType" do
      value :UNKNOWN, 0
      value :ACTIVE, 1
      value :REVOKED, 2
      value :REQUEST_REVOKED, 3
    end
    add_message "github.secretscanning.v2.AddTokenRemediationRequest" do
      optional :repository_id, :uint64, 1
      optional :token_remediation, :message, 2, "github.secretscanning.v2.TokenRemediation"
    end
    add_message "github.secretscanning.v2.GetTokenLatestRemediationRequest" do
      optional :repository_id, :uint64, 1
      repeated :numbers, :uint64, 2
    end
    add_message "github.secretscanning.v2.GetTokenLatestRemediationResponse" do
      repeated :token_remediations, :message, 1, "github.secretscanning.v2.TokenRemediation"
    end
    add_message "github.secretscanning.v2.GetTokenValidationStatusRequest" do
      optional :repository_id, :uint64, 1
      optional :token_number, :uint64, 2
      optional :requested_by_user_id, :uint64, 3
    end
    add_message "github.secretscanning.v2.GetTokenValidationStatusResponse" do
      optional :validity, :enum, 1, "github.secretscanning.v2.TokenValidity"
      optional :validation_details, :message, 2, "github.secretscanning.v2.TokenValidationDetails"
      repeated :token_groups, :message, 3, "github.secretscanning.v2.TokenGroup"
    end
    add_message "github.secretscanning.v2.GetGeneratedAlertActivityAuditRequest" do
      repeated :permissions_sets, :message, 1, "github.secretscanning.v2.GetGeneratedAlertActivityAuditRequest.PermissionSet"
      repeated :activities, :message, 2, "github.secretscanning.v2.GetGeneratedAlertActivityAuditRequest.Activity"
    end
    add_message "github.secretscanning.v2.GetGeneratedAlertActivityAuditRequest.Permission" do
      optional :scope, :string, 1
      optional :permission, :string, 2
    end
    add_message "github.secretscanning.v2.GetGeneratedAlertActivityAuditRequest.PermissionSet" do
      optional :target_type, :string, 1
      optional :target_name, :string, 2
      repeated :permissions, :message, 3, "github.secretscanning.v2.GetGeneratedAlertActivityAuditRequest.Permission"
    end
    add_message "github.secretscanning.v2.GetGeneratedAlertActivityAuditRequest.Activity" do
      optional :action, :string, 1
      optional :request_method, :string, 2
      optional :target, :string, 3
      optional :target_type, :string, 4
    end
    add_message "github.secretscanning.v2.GetGeneratedAlertActivityAuditResponse" do
      optional :explanation, :string, 1
    end
    add_message "github.secretscanning.v2.GetGeneratedAlertAutofixRequest" do
      optional :repository_id, :uint64, 1
      optional :token_number, :uint64, 2
    end
    add_message "github.secretscanning.v2.GetGeneratedAlertAutofixResponse" do
      optional :original_code_fragment, :string, 1
      optional :suggested_code_fragment, :string, 2
      optional :fix_explanation, :string, 3
      repeated :changed_diff_lines, :uint64, 4
    end
    add_message "github.secretscanning.v2.PanicRequest" do
      optional :request, :string, 1
    end
    add_message "github.secretscanning.v2.PanicResponse" do
      optional :response, :string, 1
    end
    add_message "github.secretscanning.v2.BusinessSelector" do
      repeated :organization_ids, :uint64, 1
      repeated :repository_ids, :uint64, 2
      repeated :repository_visibilities, :enum, 3, "github.secretscanning.v2.RepositoryVisibility"
      optional :repos_are_excluded, :bool, 4
      optional :id, :uint64, 5
      repeated :user_ids, :uint64, 6
      optional :user_filter, :enum, 7, "github.secretscanning.v2.BusinessSelector.user_filter_type"
      repeated :owner_types, :enum, 8, "github.secretscanning.v2.BusinessSelector.OwnerType"
      repeated :excluded_owner_types, :enum, 9, "github.secretscanning.v2.BusinessSelector.OwnerType"
    end
    add_enum "github.secretscanning.v2.BusinessSelector.user_filter_type" do
      value :ALL, 0
      value :NONE, 1
      value :ONLY, 2
      value :EXCEPT, 3
    end
    add_enum "github.secretscanning.v2.BusinessSelector.OwnerType" do
      value :OWNER_TYPE_UNSPECIFIED, 0
      value :OWNER_TYPE_ORGANIZATION, 1
      value :OWNER_TYPE_USER, 2
    end
    add_message "github.secretscanning.v2.OrgSelector" do
      optional :owner_id, :uint64, 1
      repeated :repository_ids, :uint64, 2
      repeated :repository_visibilities, :enum, 3, "github.secretscanning.v2.RepositoryVisibility"
      optional :repos_are_excluded, :bool, 4
    end
    add_message "github.secretscanning.v2.RepoSelector" do
      optional :repository_id, :uint64, 1
    end
    add_message "github.secretscanning.v2.GetTokensRequest" do
      optional :sort_order, :enum, 2, "github.secretscanning.v2.SortOrder"
      optional :token_state, :enum, 3, "github.secretscanning.v2.TokenState"
      optional :limit, :uint32, 4
      optional :page, :uint32, 5
      repeated :feature_flags, :string, 6
      repeated :token_providers, :string, 9
      repeated :resolution, :enum, 11, "github.secretscanning.v2.Token.Resolution"
      repeated :token_slugs, :string, 12
      optional :previous_cursor, :bytes, 15
      optional :next_cursor, :bytes, 16
      repeated :exclude_token_providers, :string, 19
      repeated :exclude_resolutions, :enum, 20, "github.secretscanning.v2.Token.Resolution"
      repeated :exclude_token_slugs, :string, 21
      optional :low_confidence, :bool, 22
      repeated :validity, :enum, 23, "github.secretscanning.v2.TokenValidity"
      optional :bypassed, :bool, 24
      oneof :selector do
        optional :org_selector, :message, 7, "github.secretscanning.v2.OrgSelector"
        optional :repo_selector, :message, 8, "github.secretscanning.v2.RepoSelector"
        optional :business_selector, :message, 13, "github.secretscanning.v2.BusinessSelector"
      end
    end
    add_message "github.secretscanning.v2.TokenType" do
      optional :type_value, :string, 1
      optional :label_value, :string, 2
      optional :slug_value, :string, 3
    end
    add_message "github.secretscanning.v2.GetTokensResponse" do
      repeated :tokens, :message, 1, "github.secretscanning.v2.Token"
      optional :resolved_count, :uint64, 2
      optional :unresolved_count, :uint64, 3
      optional :has_pending_backfill, :bool, 4
      optional :has_backfill_scanning_terminal_error, :bool, 5
      optional :has_backfill_scan_max_candidates, :bool, 6
      repeated :token_types, :message, 7, "github.secretscanning.v2.TokenType"
      optional :next_cursor, :bytes, 8
      optional :previous_cursor, :bytes, 9
    end
    add_message "github.secretscanning.v2.GetTokenRequest" do
      optional :repository_id, :uint64, 1
      optional :token_id, :uint64, 2
      optional :include_commit_oids, :bool, 3
      optional :limit, :uint32, 4
      optional :page, :uint32, 5
      optional :include_included_locations, :bool, 6
      repeated :feature_flags, :string, 8
      optional :include_location_count, :bool, 9
      optional :include_config_filters, :bool, 10
    end
    add_message "github.secretscanning.v2.TokenLocationIdsSelector" do
      repeated :location_ids, :uint64, 1
    end
    add_message "github.secretscanning.v2.GetTokenLocationsRequest" do
      optional :repository_id, :uint64, 1
      optional :token_number, :uint64, 2
      optional :cursor, :bytes, 3
      oneof :selector do
        optional :locations_ids_selector, :message, 4, "github.secretscanning.v2.TokenLocationIdsSelector"
      end
    end
    add_message "github.secretscanning.v2.GetTokenLocationsResponse" do
      repeated :locations, :message, 1, "github.secretscanning.v2.TokenLocation"
      optional :next_cursor, :bytes, 2
      optional :token, :message, 3, "github.secretscanning.v2.Token"
    end
    add_message "github.secretscanning.v2.GetTokensMeanTimeToRemediationRequest" do
      oneof :selector do
        optional :org_selector, :message, 1, "github.secretscanning.v2.OrgSelector"
      end
    end
    add_message "github.secretscanning.v2.GetTokensMeanTimeToRemediationResponse" do
      optional :mttr_days, :int64, 1
    end
    add_message "github.secretscanning.v2.GetTokenResponse" do
      optional :token, :message, 1, "github.secretscanning.v2.Token"
      optional :has_ignored_locations, :bool, 2
      repeated :commit_oids, :string, 3
      optional :included_locations_count, :uint64, 4
      repeated :included_locations, :message, 5, "github.secretscanning.v2.TokenLocation"
      optional :custom_pattern_data, :message, 6, "github.secretscanning.v2.GetTokenResponse.CustomPatternData"
    end
    add_message "github.secretscanning.v2.GetTokenResponse.CustomPatternData" do
      optional :custom_pattern_id, :uint64, 1
      optional :owner_id, :uint64, 2
      optional :owner_scope, :enum, 3, "github.secretscanning.v1.OwnerScope"
      optional :state, :enum, 4, "github.secretscanning.v2.CustomPatternState"
    end
    add_message "github.secretscanning.v2.ResolveTokenRequest" do
      optional :repository_id, :uint64, 1
      optional :token_id, :uint64, 2
      optional :resolution, :enum, 3, "github.secretscanning.v2.Token.Resolution"
      optional :resolver_id, :uint64, 4
      optional :default_branch_name, :string, 5
      repeated :feature_flags, :string, 6
      optional :resolution_comment, :string, 7
    end
    add_message "github.secretscanning.v2.ResolveTokenResponse" do
    end
    add_message "github.secretscanning.v2.ResolveTokensRequest" do
      optional :repository_id, :uint64, 1
      repeated :token_numbers, :uint64, 2
      optional :resolution, :enum, 3, "github.secretscanning.v2.Token.Resolution"
      optional :resolver_id, :uint64, 4
      optional :default_branch_name, :string, 5
      repeated :feature_flags, :string, 6
      optional :resolution_comment, :string, 7
    end
    add_message "github.secretscanning.v2.ResolveTokensResponse" do
    end
    add_message "github.secretscanning.v2.GetTokenCountsRequest" do
      optional :repository_id, :uint64, 1
      repeated :feature_flags, :string, 2
      optional :low_confidence, :bool, 5
      oneof :selector do
        optional :org_selector, :message, 3, "github.secretscanning.v2.OrgSelector"
        optional :repo_selector, :message, 4, "github.secretscanning.v2.RepoSelector"
        optional :business_selector, :message, 6, "github.secretscanning.v2.BusinessSelector"
      end
    end
    add_message "github.secretscanning.v2.GetTokenCountsResponse" do
      optional :unresolved_count, :uint64, 1
      optional :has_pending_backfill, :bool, 2
      optional :resolved_count, :uint64, 3
    end
    add_message "github.secretscanning.v2.GetTokenGroupByCountsRequest" do
      repeated :feature_flags, :string, 1
      repeated :aggregations, :enum, 4, "github.secretscanning.v2.GetTokenGroupByAggregation"
      optional :token_state, :enum, 6, "github.secretscanning.v2.TokenState"
      repeated :token_providers, :string, 8
      repeated :token_slugs, :string, 9
      repeated :exclude_token_providers, :string, 10
      repeated :exclude_resolutions, :enum, 11, "github.secretscanning.v2.Token.Resolution"
      repeated :exclude_token_slugs, :string, 12
      optional :low_confidence, :bool, 13
      oneof :selector do
        optional :org_selector, :message, 2, "github.secretscanning.v2.OrgSelector"
        optional :repo_selector, :message, 3, "github.secretscanning.v2.RepoSelector"
        optional :business_selector, :message, 5, "github.secretscanning.v2.BusinessSelector"
      end
    end
    add_message "github.secretscanning.v2.GetTokenGroupByCountsResponse" do
      repeated :counts, :message, 1, "github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount"
    end
    add_message "github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount" do
      oneof :aggregation do
        optional :repo_aggregation, :message, 1, "github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.RepoTokenCountAggregation"
        optional :provider_aggregation, :message, 2, "github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.ProviderTokenCountAggregation"
        optional :type_aggregation, :message, 3, "github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.SecretTypeTokenCountAggregation"
      end
    end
    add_message "github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.SecretTypeTokenCountAggregation" do
      repeated :counts, :message, 1, "github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.SecretTypeTokenCountAggregation.TypeCount"
    end
    add_message "github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.SecretTypeTokenCountAggregation.TypeCount" do
      optional :type, :message, 1, "github.secretscanning.v2.TokenType"
      optional :unresolved_count, :uint64, 2
      optional :resolved_count, :uint64, 3
    end
    add_message "github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.ProviderTokenCountAggregation" do
      repeated :counts, :message, 1, "github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.ProviderTokenCountAggregation.ProviderCount"
    end
    add_message "github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.ProviderTokenCountAggregation.ProviderCount" do
      optional :provider_name, :string, 1
      optional :unresolved_count, :uint64, 2
      optional :resolved_count, :uint64, 3
    end
    add_message "github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.RepoTokenCountAggregation" do
      repeated :counts, :message, 1, "github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.RepoTokenCountAggregation.RepoCount"
    end
    add_message "github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.RepoTokenCountAggregation.RepoCount" do
      optional :repository_id, :uint64, 1
      optional :unresolved_count, :uint64, 2
      optional :resolved_count, :uint64, 3
    end
    add_message "github.secretscanning.v2.GetTokenTypesInfoRequest" do
      optional :repository_id, :uint64, 1
      oneof :selector do
        optional :org_selector, :message, 2, "github.secretscanning.v2.OrgSelector"
        optional :repo_selector, :message, 3, "github.secretscanning.v2.RepoSelector"
      end
    end
    add_message "github.secretscanning.v2.GetTokenTypesInfoResponse" do
      repeated :token_types, :message, 1, "github.secretscanning.v2.TokenType"
    end
    add_message "github.secretscanning.v2.ValidateEnabledReposRequest" do
      repeated :repository_ids, :uint64, 1
    end
    add_message "github.secretscanning.v2.ValidateEnabledReposResponse" do
      repeated :repository_ids, :uint64, 1
    end
    add_message "github.secretscanning.v2.ReportTokenRequest" do
      optional :repository_id, :uint64, 1
      optional :number, :uint64, 2
      optional :reporting_user_id, :uint64, 3
    end
    add_message "github.secretscanning.v2.ReportTokenResponse" do
      optional :validity, :enum, 1, "github.secretscanning.v2.TokenValidity"
      optional :validation_details, :message, 2, "github.secretscanning.v2.TokenValidationDetails"
    end
    add_message "github.secretscanning.v2.Token" do
      optional :token_type, :string, 1
      optional :token_signature, :string, 2
      optional :created_at, :message, 3, "google.protobuf.Timestamp"
      optional :updated_at, :message, 4, "google.protobuf.Timestamp"
      optional :repository_id, :uint64, 5
      optional :resolution, :enum, 6, "github.secretscanning.v2.Token.Resolution"
      optional :resolver_id, :uint64, 7
      optional :resolved_at, :message, 8, "google.protobuf.Timestamp"
      optional :id, :uint64, 9
      optional :first_location, :message, 10, "github.secretscanning.v2.TokenLocation"
      optional :number, :uint64, 11
      optional :scan_scope, :enum, 12, "github.secretscanning.v2.TokenScanScope"
      optional :label, :string, 13
      optional :slug, :string, 14
      optional :token_of_type, :enum, 15, "github.secretscanning.v2.Token.of_type"
      optional :push_protection_bypassed, :bool, 16
      optional :push_protection_bypassed_by_user_id, :uint64, 17
      optional :push_protection_bypassed_at, :message, 18, "google.protobuf.Timestamp"
      optional :token_type_provider, :string, 19
      optional :token_url, :string, 20
      optional :revoked_by, :uint64, 21
      optional :revoked_at, :message, 22, "google.protobuf.Timestamp"
      optional :resolution_comment, :string, 23
      optional :encrypted_token, :bytes, 24
      optional :external_remediation_doc_url, :string, 25
      optional :validity, :enum, 26, "github.secretscanning.v2.TokenValidity"
      optional :validation_details, :message, 27, "github.secretscanning.v2.TokenValidationDetails"
      optional :validation_support, :message, 28, "github.secretscanning.v2.TokenValidationSupport"
      repeated :token_groups, :message, 29, "github.secretscanning.v2.TokenGroup"
      optional :low_confidence, :bool, 30
      optional :llm_detected, :bool, 31
      optional :is_multipart, :bool, 32
      optional :publicly_leaked, :bool, 33
      optional :multi_repo, :bool, 34
    end
    add_enum "github.secretscanning.v2.Token.of_type" do
      value :UNKNOWN, 0
      value :BUILT_IN, 1
      value :CUSTOM, 2
    end
    add_enum "github.secretscanning.v2.Token.Resolution" do
      value :NO_RESOLUTION, 0
      value :REVOKED, 1
      value :FALSE_POSITIVE, 2
      value :WONT_FIX, 4
      value :REOPENED, 5
      value :USED_IN_TESTS, 6
      value :PATTERN_DELETED, 7
      value :PATTERN_EDITED, 8
      value :HIDDEN_BY_CONFIG, 9
    end
    add_message "github.secretscanning.v2.TokenValidationDetails" do
      optional :validity_last_checked, :message, 27, "google.protobuf.Timestamp"
      optional :async_check_requested_at, :message, 28, "google.protobuf.Timestamp"
    end
    add_message "github.secretscanning.v2.TokenGroup" do
      optional :validation_details, :message, 1, "github.secretscanning.v2.TokenValidationDetails"
      optional :validity, :enum, 2, "github.secretscanning.v2.TokenValidity"
      repeated :members, :message, 3, "github.secretscanning.v2.TokenGroup.TokenMember"
    end
    add_message "github.secretscanning.v2.TokenGroup.TokenMember" do
      optional :label, :string, 1
      optional :number, :uint64, 2
    end
    add_message "github.secretscanning.v2.TokenValidationSupport" do
      optional :on_demand_checks_supported, :bool, 1
      optional :validity_checks_supported, :bool, 2
    end
    add_message "github.secretscanning.v2.TokenLocation" do
      optional :created_at, :message, 1, "google.protobuf.Timestamp"
      optional :updated_at, :message, 2, "google.protobuf.Timestamp"
      optional :commit_oid, :string, 3
      optional :blob_oid, :string, 4
      optional :deprecated_path, :string, 5
      optional :path, :bytes, 11
      optional :start_line, :uint64, 6
      optional :end_line, :uint64, 7
      optional :start_column, :uint64, 8
      optional :end_column, :uint64, 9
      optional :blob_paths_processed, :bool, 10
      optional :content_type, :enum, 12, "github.secretscanning.v2.ContentType"
      optional :content_id, :uint64, 13
      optional :content_number, :uint32, 14
    end
    add_enum "github.secretscanning.v2.ContentType" do
      value :CONTENT_TYPE_UNKNOWN, 0
      value :REPOSITORY_BLOB, 1
      value :COMMIT_METADATA, 2
      value :COMMIT_COMMENT, 3
      value :PULL_REQUEST_TITLE, 4
      value :PULL_REQUEST_BODY, 5
      value :PULL_REQUEST_COMMENT, 6
      value :PULL_REQUEST_REVIEW_COMMENT, 7
      value :PULL_REQUEST_TIMELINE_COMMENT, 8
      value :ISSUE_TITLE, 9
      value :ISSUE_BODY, 10
      value :ISSUE_COMMENT, 11
      value :DISCUSSION_TITLE, 12
      value :DISCUSSION_BODY, 13
      value :DISCUSSION_COMMENT, 14
      value :WIKI_BLOB, 15
    end
    add_enum "github.secretscanning.v2.SortOrder" do
      value :NO_SORT_ORDER, 0
      value :CREATED_ASCENDING, 1
      value :CREATED_DESCENDING, 2
      value :UPDATED_ASCENDING, 3
      value :UPDATED_DESCENDING, 4
    end
    add_enum "github.secretscanning.v2.TokenState" do
      value :NO_STATE, 0
      value :OPEN, 1
      value :RESOLVED, 2
    end
    add_enum "github.secretscanning.v2.TokenScanScope" do
      value :UNKNOWN, 0
      value :REPO, 1
      value :COMMIT, 2
    end
    add_enum "github.secretscanning.v2.GetTokenGroupByAggregation" do
      value :UNKNOWN_AGGREGATION, 0
      value :SECRET_TYPE, 1
      value :SECRET_PROVIDER, 2
      value :REPOSITORY, 3
    end
    add_enum "github.secretscanning.v2.RepositoryVisibility" do
      value :REPOSITORY_VISIBILITY_UNKNOWN, 0
      value :REPOSITORY_VISIBILITY_PUBLIC, 1
      value :REPOSITORY_VISIBILITY_PRIVATE, 2
      value :REPOSITORY_VISIBILITY_INTERNAL, 3
    end
    add_enum "github.secretscanning.v2.TokenValidity" do
      value :TOKEN_VALIDITY_UNKNOWN, 0
      value :TOKEN_VALIDITY_ACTIVE, 1
      value :TOKEN_VALIDITY_INACTIVE, 2
      value :TOKEN_VALIDITY_REVOKED, 3
      value :TOKEN_VALIDITY_UNVERIFIABLE, 4
    end
  end
end

module GitHub
  module Proto
    module SecretScanning
      module Api
        module V2
          GetTimelineRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTimelineRequest").msgclass
          GetTimelineResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTimelineResponse").msgclass
          TimelineSegment = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TimelineSegment").msgclass
          GetMoreTimelineEventsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetMoreTimelineEventsRequest").msgclass
          GetMoreTimelineEventsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetMoreTimelineEventsResponse").msgclass
          TimelineEvent = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TimelineEvent").msgclass
          TimelineEvent::TimelineEventType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TimelineEvent.TimelineEventType").enummodule
          ValidityEvent = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.ValidityEvent").msgclass
          ResolutionEvent = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.ResolutionEvent").msgclass
          TokenRemediation = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TokenRemediation").msgclass
          TokenRemediation::EventType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TokenRemediation.EventType").enummodule
          AddTokenRemediationRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.AddTokenRemediationRequest").msgclass
          GetTokenLatestRemediationRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenLatestRemediationRequest").msgclass
          GetTokenLatestRemediationResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenLatestRemediationResponse").msgclass
          GetTokenValidationStatusRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenValidationStatusRequest").msgclass
          GetTokenValidationStatusResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenValidationStatusResponse").msgclass
          GetGeneratedAlertActivityAuditRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetGeneratedAlertActivityAuditRequest").msgclass
          GetGeneratedAlertActivityAuditRequest::Permission = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetGeneratedAlertActivityAuditRequest.Permission").msgclass
          GetGeneratedAlertActivityAuditRequest::PermissionSet = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetGeneratedAlertActivityAuditRequest.PermissionSet").msgclass
          GetGeneratedAlertActivityAuditRequest::Activity = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetGeneratedAlertActivityAuditRequest.Activity").msgclass
          GetGeneratedAlertActivityAuditResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetGeneratedAlertActivityAuditResponse").msgclass
          GetGeneratedAlertAutofixRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetGeneratedAlertAutofixRequest").msgclass
          GetGeneratedAlertAutofixResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetGeneratedAlertAutofixResponse").msgclass
          PanicRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.PanicRequest").msgclass
          PanicResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.PanicResponse").msgclass
          BusinessSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.BusinessSelector").msgclass
          BusinessSelector::User_filter_type = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.BusinessSelector.user_filter_type").enummodule
          BusinessSelector::OwnerType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.BusinessSelector.OwnerType").enummodule
          OrgSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.OrgSelector").msgclass
          RepoSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.RepoSelector").msgclass
          GetTokensRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokensRequest").msgclass
          TokenType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TokenType").msgclass
          GetTokensResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokensResponse").msgclass
          GetTokenRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenRequest").msgclass
          TokenLocationIdsSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TokenLocationIdsSelector").msgclass
          GetTokenLocationsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenLocationsRequest").msgclass
          GetTokenLocationsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenLocationsResponse").msgclass
          GetTokensMeanTimeToRemediationRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokensMeanTimeToRemediationRequest").msgclass
          GetTokensMeanTimeToRemediationResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokensMeanTimeToRemediationResponse").msgclass
          GetTokenResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenResponse").msgclass
          GetTokenResponse::CustomPatternData = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenResponse.CustomPatternData").msgclass
          ResolveTokenRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.ResolveTokenRequest").msgclass
          ResolveTokenResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.ResolveTokenResponse").msgclass
          ResolveTokensRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.ResolveTokensRequest").msgclass
          ResolveTokensResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.ResolveTokensResponse").msgclass
          GetTokenCountsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenCountsRequest").msgclass
          GetTokenCountsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenCountsResponse").msgclass
          GetTokenGroupByCountsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenGroupByCountsRequest").msgclass
          GetTokenGroupByCountsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenGroupByCountsResponse").msgclass
          GetTokenGroupByCountsResponse::AggregationCount = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount").msgclass
          GetTokenGroupByCountsResponse::AggregationCount::SecretTypeTokenCountAggregation = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.SecretTypeTokenCountAggregation").msgclass
          GetTokenGroupByCountsResponse::AggregationCount::SecretTypeTokenCountAggregation::TypeCount = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.SecretTypeTokenCountAggregation.TypeCount").msgclass
          GetTokenGroupByCountsResponse::AggregationCount::ProviderTokenCountAggregation = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.ProviderTokenCountAggregation").msgclass
          GetTokenGroupByCountsResponse::AggregationCount::ProviderTokenCountAggregation::ProviderCount = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.ProviderTokenCountAggregation.ProviderCount").msgclass
          GetTokenGroupByCountsResponse::AggregationCount::RepoTokenCountAggregation = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.RepoTokenCountAggregation").msgclass
          GetTokenGroupByCountsResponse::AggregationCount::RepoTokenCountAggregation::RepoCount = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenGroupByCountsResponse.AggregationCount.RepoTokenCountAggregation.RepoCount").msgclass
          GetTokenTypesInfoRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenTypesInfoRequest").msgclass
          GetTokenTypesInfoResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenTypesInfoResponse").msgclass
          ValidateEnabledReposRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.ValidateEnabledReposRequest").msgclass
          ValidateEnabledReposResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.ValidateEnabledReposResponse").msgclass
          ReportTokenRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.ReportTokenRequest").msgclass
          ReportTokenResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.ReportTokenResponse").msgclass
          Token = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.Token").msgclass
          Token::Of_type = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.Token.of_type").enummodule
          Token::Resolution = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.Token.Resolution").enummodule
          TokenValidationDetails = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TokenValidationDetails").msgclass
          TokenGroup = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TokenGroup").msgclass
          TokenGroup::TokenMember = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TokenGroup.TokenMember").msgclass
          TokenValidationSupport = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TokenValidationSupport").msgclass
          TokenLocation = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TokenLocation").msgclass
          ContentType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.ContentType").enummodule
          SortOrder = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.SortOrder").enummodule
          TokenState = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TokenState").enummodule
          TokenScanScope = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TokenScanScope").enummodule
          GetTokenGroupByAggregation = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.GetTokenGroupByAggregation").enummodule
          RepositoryVisibility = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.RepositoryVisibility").enummodule
          TokenValidity = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v2.TokenValidity").enummodule
        end
      end
    end
  end
end
