# Code generated by protoc-gen-twirp_ruby 1.6.0, DO NOT EDIT.
require 'twirp'
require_relative 'metrics_api_pb.rb'

module GitHub
  module Proto
    module SecretScanning
      module Metrics
        module V1
          class MetricsAPIService < Twirp::Service
            package 'github.secretscanning.metrics.v1'
            service 'MetricsAPI'
            rpc :GetAlertsForInsightsBackfill, GetAlertsForInsightsBackfillRequest, GetAlertsForInsightsBackfillRequestResponse, :ruby_method => :get_alerts_for_insights_backfill
            rpc :GetTokenAlertMetrics, GetTokenAlertMetricsRequest, GetTokenAlertMetricsResponse, :ruby_method => :get_token_alert_metrics
            rpc :GetTokenPushProtectionMetrics, GetTokenPushProtectionMetricsRequest, GetTokenPushProtectionMetricsResponse, :ruby_method => :get_token_push_protection_metrics
            rpc :GetPushProtectionMetrics, GetPushProtectionMetricsRequest, GetPushProtectionMetricsResponse, :ruby_method => :get_push_protection_metrics
            rpc :GetPushProtectionMetricsForRepos, GetPushProtectionMetricsForReposRequest, GetPushProtectionMetricsForReposResponse, :ruby_method => :get_push_protection_metrics_for_repos
            rpc :GetBlockCountsByTokenType, GetBlockCountsByTokenTypeRequest, GetBlockCountsByTokenTypeResponse, :ruby_method => :get_block_counts_by_token_type
            rpc :GetBlockCountsByRepo, GetBlockCountsByRepoRequest, GetBlockCountsByRepoResponse, :ruby_method => :get_block_counts_by_repo
            rpc :GetBypassCountsByTokenType, GetBypassCountsByTokenTypeRequest, GetBypassCountsByTokenTypeResponse, :ruby_method => :get_bypass_counts_by_token_type
            rpc :GetBypassCountsByRepo, GetBypassCountsByRepoRequest, GetBypassCountsByRepoResponse, :ruby_method => :get_bypass_counts_by_repo
          end

          class MetricsAPIClient < Twirp::Client
            client_for MetricsAPIService
          end
        end
      end
    end
  end
end
