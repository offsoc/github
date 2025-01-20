# frozen_string_literal: true

require "github/proto/secret_scanning/version"

$LOAD_PATH.unshift File.join(File.dirname(__FILE__), "github", "proto", "secret_scanning")
Dir["#{File.dirname(__FILE__)}/github/**/*_twirp.rb"].each { |file| require file }

module GitHub
  module Proto
    module SecretScanning
      module Api
        module V1
          class ScansAPI
            attr_reader :scans_client

            def initialize(conn, opts = {})
              @scans_client = GitHub::Proto::SecretScanning::Scans::V1::ScansAPIClient.new(conn, opts)
            end

            def add_bypass(options)
              scans_client.add_bypass(GitHub::Proto::SecretScanning::Scans::V1::AddBypassRequest.new(options))
            end

            def promote_bypass(options)
              scans_client.promote_bypass(GitHub::Proto::SecretScanning::Scans::V1::PromoteBypassRequest.new(options))
            end

            def get_bypass_placeholder(options)
              scans_client.get_bypass_placeholder(GitHub::Proto::SecretScanning::Scans::V1::GetBypassPlaceholderRequest.new(options))
            end
          end

          class DryRunsAPI
            attr_reader :dry_runs_client

            def initialize(conn, opts = {})
              @dry_runs_client = GitHub::Proto::SecretScanning::Api::V1::DryRunsAPIClient.new(conn, opts)
            end

            def cancel_dry_runs_for_custom_pattern(options)
              dry_runs_client.cancel_dry_runs_for_custom_pattern(GitHub::Proto::SecretScanning::Api::V1::CancelDryRunsForCustomPatternRequest.new(options))
            end

            def dry_run_metadata_for_pattern(options)
              dry_runs_client.dry_run_metadata_for_pattern(GitHub::Proto::SecretScanning::Api::V1::DryRunMetadataForPatternRequest.new(options))
            end

            def dry_run_results_for_pattern(options)
              dry_runs_client.dry_run_results_for_pattern(GitHub::Proto::SecretScanning::Api::V1::DryRunResultsRequest.new(options))
            end
          end

          class MetricsAPI
            attr_reader :metrics_client

            def initialize(conn, opts = {})
              @metrics_client = GitHub::Proto::SecretScanning::Metrics::V1::MetricsAPIClient.new(conn, opts)
            end

            def get_alerts_for_insights_backfill(options)
              metrics_client.get_alerts_for_insights_backfill(GitHub::Proto::SecretScanning::Metrics::V1::GetAlertsForInsightsBackfillRequest.new(options))
            end

            def get_token_alert_metrics(options)
              metrics_client.get_token_alert_metrics(GitHub::Proto::SecretScanning::Metrics::V1::GetTokenAlertMetricsRequest.new(options))
            end

            def get_token_push_protection_metrics(options)
              metrics_client.get_token_push_protection_metrics(GitHub::Proto::SecretScanning::Metrics::V1::GetTokenPushProtectionMetricsRequest.new(options))
            end

            def get_push_protection_metrics(options)
              metrics_client.get_push_protection_metrics(GitHub::Proto::SecretScanning::Metrics::V1::GetPushProtectionMetricsRequest.new(options))
            end

            def get_block_counts_by_token_type(options)
              metrics_client.get_block_counts_by_token_type(GitHub::Proto::SecretScanning::Metrics::V1::GetBlockCountsByTokenTypeRequest.new(options))
            end

            def get_block_counts_by_repo(options)
              metrics_client.get_block_counts_by_repo(GitHub::Proto::SecretScanning::Metrics::V1::GetBlockCountsByRepoRequest.new(options))
            end

            def get_bypass_counts_by_token_type(options)
              metrics_client.get_bypass_counts_by_token_type(GitHub::Proto::SecretScanning::Metrics::V1::GetBypassCountsByTokenTypeRequest.new(options))
            end

            def get_bypass_counts_by_repo(options)
              metrics_client.get_bypass_counts_by_repo(GitHub::Proto::SecretScanning::Metrics::V1::GetBypassCountsByRepoRequest.new(options))
            end

            def get_push_protection_metrics_for_repos(options)
              metrics_client.get_push_protection_metrics_for_repos(GitHub::Proto::SecretScanning::Metrics::V1::GetPushProtectionMetricsForReposRequest.new(options))
            end
          end

          class JobGroupsAPI
            attr_reader :job_groups_client

            def initialize(conn, opts = {})
              @job_groups_client = GitHub::Proto::SecretScanning::Api::V1::JobGroupsAPIClient.new(conn, opts)
            end

            def get_job_group_summary(options)
              job_groups_client.get_job_group_summary(GitHub::Proto::SecretScanning::Api::V1::JobGroupSummaryRequest.new(options))
            end
          end


          class Client
            attr_reader :token_client, :custom_patterns_client

            def initialize(conn, opts = {})
              @token_client = GitHub::Proto::SecretScanning::Api::V1::TokenAPIClient.new(conn, opts)
              @custom_patterns_client = GitHub::Proto::SecretScanning::Api::V1::CustomPatternAPIClient.new(conn, opts)
            end

            def get_tokens(options)
              token_client.get_tokens(GitHub::Proto::SecretScanning::Api::V1::GetTokensRequest.new(options))
            end

            def get_token(options)
              token_client.get_token(GitHub::Proto::SecretScanning::Api::V1::GetTokenRequest.new(options))
            end

            def resolve_token(options)
              token_client.resolve_token(GitHub::Proto::SecretScanning::Api::V1::ResolveTokenRequest.new(options))
            end

            def get_token_counts(options)
              token_client.get_token_counts(GitHub::Proto::SecretScanning::Api::V1::GetTokenCountsRequest.new(options))
            end

            def get_token_types_info(options)
              token_client.get_token_types_info(GitHub::Proto::SecretScanning::Api::V1::GetTokenTypesInfoRequest.new(options))
            end

            def get_pattern_matches(options)
              custom_patterns_client.get_pattern_matches(GitHub::Proto::SecretScanning::Api::V1::GetPatternMatchesRequest.new(options))
            end

            def get_custom_patterns(options)
              custom_patterns_client.get_custom_patterns(GitHub::Proto::SecretScanning::Api::V1::GetCustomPatternsRequest.new(options))
            end

            def get_custom_pattern(options)
              custom_patterns_client.get_custom_pattern(GitHub::Proto::SecretScanning::Api::V1::GetCustomPatternRequest.new(options))
            end

            def create_custom_pattern(options)
              custom_patterns_client.create_custom_pattern(GitHub::Proto::SecretScanning::Api::V1::CreateCustomPatternRequest.new(options))
            end

            def delete_custom_pattern(options)
              custom_patterns_client.delete_custom_pattern(GitHub::Proto::SecretScanning::Api::V1::DeleteCustomPatternRequest.new(options))
            end
          end

          class ExemptionsAPI
            attr_reader :exemptions_client

            def initialize(conn, opts = {})
              @exemptions_client = GitHub::Proto::SecretScanning::Api::V1::ExemptionsAPIClient.new(conn, opts)
            end

            def get_exemption(options)
              exemptions_client.get_exemption(GitHub::Proto::SecretScanning::Api::V1::GetExemptionRequest.new(options))
            end  
          end
        end

        module V2
          module Clients
            class ScansAPI
              attr_reader :scans_client

              def initialize(conn, opts = {})
                @scans_client = GitHub::Proto::SecretScanning::Scans::V2::ScansAPIClient.new(conn, opts)
              end

              def scan_push(options)
                @scans_client.scan_push(GitHub::Proto::SecretScanning::Scans::V2::ScanPushRequest.new(options))
              end

              def scan_bytes(options)
                @scans_client.scan_bytes(GitHub::Proto::SecretScanning::Scans::V2::ScanBytesRequest.new(options))
              end

              def add_bypass_reviewer(options)
                scans_client.add_bypass_reviewer(GitHub::Proto::SecretScanning::Scans::V2::AddBypassReviewerRequest.new(options))
              end

              def remove_bypass_reviewer(options)
                scans_client.remove_bypass_reviewer(GitHub::Proto::SecretScanning::Scans::V2::RemoveBypassReviewerRequest.new(options))
              end

              def get_bypass_reviewers(options)
                scans_client.get_bypass_reviewers(GitHub::Proto::SecretScanning::Scans::V2::GetBypassReviewersRequest.new(options))
              end 
            end

            class TokenAPI
              attr_reader :token_client

              def initialize(conn, opts = {})
                @token_client = GitHub::Proto::SecretScanning::Api::V2::TokenAPIClient.new(conn, opts)
              end

              def get_tokens(options)
                token_client.get_tokens(GitHub::Proto::SecretScanning::Api::V2::GetTokensRequest.new(options))
              end

              def get_token(options)
                token_client.get_token(GitHub::Proto::SecretScanning::Api::V2::GetTokenRequest.new(options))
              end

              def get_token_locations(options)
                token_client.get_token_locations(GitHub::Proto::SecretScanning::Api::V2::GetTokenLocationsRequest.new(options))
              end

              def resolve_token(options)
                token_client.resolve_token(GitHub::Proto::SecretScanning::Api::V2::ResolveTokenRequest.new(options))
              end

              def resolve_tokens(options)
                token_client.resolve_tokens(GitHub::Proto::SecretScanning::Api::V2::ResolveTokensRequest.new(options))
              end

              def get_token_counts(options)
                token_client.get_token_counts(GitHub::Proto::SecretScanning::Api::V2::GetTokenCountsRequest.new(options))
              end

              def get_tokens_mean_time_to_remediation(options)
                token_client.get_tokens_mean_time_to_remediation(GitHub::Proto::SecretScanning::Api::V2::GetTokensMeanTimeToRemediationRequest.new(options))
              end

              def get_token_types_info(options)
                token_client.get_token_types_info(GitHub::Proto::SecretScanning::Api::V2::GetTokenTypesInfoRequest.new(options))
              end

              def get_token_group_by_counts(options)
                token_client.get_token_group_by_counts(GitHub::Proto::SecretScanning::Api::V2::GetTokenGroupByCountsRequest.new(options))
              end

              def validate_enabled_repos(options)
                token_client.validate_enabled_repos(GitHub::Proto::SecretScanning::Api::V2::ValidateEnabledReposRequest.new(options))
              end

              def get_token_latest_remediation(options)
                token_client.get_token_latest_remediation(GitHub::Proto::SecretScanning::Api::V2::GetTokenLatestRemediationRequest.new(options))
              end

              def add_token_remediation(options)
                token_client.add_token_remediation(GitHub::Proto::SecretScanning::Api::V2::AddTokenRemediationRequest.new(options))
              end

              def get_generated_alert_autofix(options)
                token_client.get_generated_alert_autofix(GitHub::Proto::SecretScanning::Api::V2::GetGeneratedAlertAutofixRequest.new(options))
              end

              def get_generated_alert_activity_audit(options)
                token_client.get_generated_alert_activity_audit(GitHub::Proto::SecretScanning::Api::V2::GetGeneratedAlertActivityAuditRequest.new(options))
              end

              def get_timeline(options)
                token_client.get_timeline(GitHub::Proto::SecretScanning::Api::V2::GetTimelineRequest.new(options))
              end

              def get_more_timeline_events(options)
                token_client.get_more_timeline_events(GitHub::Proto::SecretScanning::Api::V2::GetMoreTimelineEventsRequest.new(options))
              end

              def get_token_validation_status(options)
                token_client.get_token_validation_status(GitHub::Proto::SecretScanning::Api::V2::GetTokenValidationStatusRequest.new(options))
              end

              def report_token(options)
                token_client.report_token(GitHub::Proto::SecretScanning::Api::V2::ReportTokenRequest.new(options))
              end
            end

            class CustomPatternAPI
              attr_reader :custom_patterns_client

              def initialize(conn, opts = {})
                @custom_patterns_client = GitHub::Proto::SecretScanning::Api::V2::CustomPatternAPIClient.new(conn, opts)
              end

              def get_pattern_matches(options)
                custom_patterns_client.get_pattern_matches(GitHub::Proto::SecretScanning::Api::V2::GetPatternMatchesRequest.new(options))
              end

              def get_custom_pattern(options)
                custom_patterns_client.get_custom_pattern(GitHub::Proto::SecretScanning::Api::V2::GetCustomPatternRequest.new(options))
              end

              def create_custom_pattern(options)
                custom_patterns_client.create_custom_pattern(GitHub::Proto::SecretScanning::Api::V2::CreateCustomPatternRequest.new(options))
              end

              def publish_custom_pattern(options)
                custom_patterns_client.publish_custom_pattern(GitHub::Proto::SecretScanning::Api::V2::PublishCustomPatternRequest.new(options))
              end

              def update_custom_pattern(options)
                custom_patterns_client.update_custom_pattern(GitHub::Proto::SecretScanning::Api::V2::UpdateCustomPatternRequest.new(options))
              end

              def delete_custom_pattern(options)
                custom_patterns_client.delete_custom_pattern(GitHub::Proto::SecretScanning::Api::V2::DeleteCustomPatternRequest.new(options))
              end
            end
          end
        end

        module V3
          module Clients
            class CustomPatternAPI
              attr_reader :custom_patterns_client

              def initialize(conn, opts = {})
                @custom_patterns_client = GitHub::Proto::SecretScanning::Api::V3::CustomPatternAPIClient.new(conn, opts)
              end

              def get_custom_patterns(options)
                custom_patterns_client.get_custom_patterns(GitHub::Proto::SecretScanning::Api::V3::GetCustomPatternsRequest.new(options))
              end

              def get_custom_patterns_count(options)
                custom_patterns_client.get_custom_patterns_count(GitHub::Proto::SecretScanning::Api::V3::GetCustomPatternsCountRequest.new(options))
              end

              def update_custom_pattern_settings(options)
                custom_patterns_client.update_custom_pattern_settings(GitHub::Proto::SecretScanning::Api::V3::UpdateCustomPatternSettingsRequest.new(options))
              end

              def delete_custom_patterns(options)
                custom_patterns_client.delete_custom_patterns(GitHub::Proto::SecretScanning::Api::V3::DeleteCustomPatternsRequest.new(options))
              end

              def get_generated_expressions(options)
                custom_patterns_client.get_generated_expressions(GitHub::Proto::SecretScanning::Api::V3::GetGeneratedExpressionsRequest.new(options))
              end
            end
          end
        end
      end
    end
  end
end
