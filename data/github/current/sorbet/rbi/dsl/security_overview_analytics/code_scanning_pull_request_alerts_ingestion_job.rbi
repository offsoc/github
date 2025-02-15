# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `SecurityOverviewAnalytics::CodeScanningPullRequestAlertsIngestionJob`.
# Please instead update this file by running `bin/tapioca dsl SecurityOverviewAnalytics::CodeScanningPullRequestAlertsIngestionJob`.

class SecurityOverviewAnalytics::CodeScanningPullRequestAlertsIngestionJob
  class << self
    sig do
      params(
        pull_request_id: ::Integer,
        source_event: ::String,
        block: T.nilable(T.proc.params(job: SecurityOverviewAnalytics::CodeScanningPullRequestAlertsIngestionJob).void)
      ).returns(T.any(SecurityOverviewAnalytics::CodeScanningPullRequestAlertsIngestionJob, FalseClass))
    end
    def perform_later(pull_request_id:, source_event:, &block); end

    sig { params(pull_request_id: ::Integer, source_event: ::String).void }
    def perform_now(pull_request_id:, source_event:); end
  end
end
