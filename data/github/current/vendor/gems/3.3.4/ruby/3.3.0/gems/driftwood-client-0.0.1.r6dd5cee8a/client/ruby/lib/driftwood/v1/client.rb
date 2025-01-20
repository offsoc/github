# frozen_string_literal: true

require "faraday"
require "json"
require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"
require_relative "../../../lib/twirp/rpc/streaming/v1/streaming_twirp"
require_relative "../../../lib/twirp/rpc/exports/v1/exports_twirp"
require_relative "../../driftwood/async_query_twirp_request"
require_relative "../../driftwood/twirp_request"
require_relative "../../driftwood/export_twirp_request"
require_relative "../../driftwood/exports_twirp_request"
require_relative "../../driftwood/stream_twirp_request"
require_relative "./hmac_middleware"

Dir[File.join(__dir__, "..", "twirp_request", "*.rb")].each { |file| require file }
Dir[File.join(__dir__, "..", "export_twirp_request", "*.rb")].each { |file| require file }
Dir[File.join(__dir__, "..", "stream_twirp_request", "*.rb")].each { |file| require file }
Dir[File.join(__dir__, "..", "exports_twirp_request", "*.rb")].each { |file| require file }
Dir[File.join(__dir__, "..", "async_query_twirp_request", "*.rb")].each { |file| require file }

module Driftwood
  module V1
    class Client

      SUBJECT_BUSINESS     = Driftwood::Exports::V1::SubjectType::SUBJECT_TYPE_BUSINESS
      SUBJECT_EMU_BUSINESS = Driftwood::Exports::V1::SubjectType::SUBJECT_TYPE_EMU_BUSINESS
      SUBJECT_ORG          = Driftwood::Exports::V1::SubjectType::SUBJECT_TYPE_ORGANIZATION
      SUBJECT_USER         = Driftwood::Exports::V1::SubjectType::SUBJECT_TYPE_USER

      FORMAT_JSON          = Driftwood::Exports::V1::FormatType::FORMAT_TYPE_JSON
      FORMAT_CSV           = Driftwood::Exports::V1::FormatType::FORMAT_TYPE_CSV

      GIT_EXPORT           = Driftwood::Exports::V1::ExportType::EXPORT_TYPE_GIT
      WEB_EXPORT           = Driftwood::Exports::V1::ExportType::EXPORT_TYPE_WEB

      def initialize(host, faraday_options: {}, hmac_key: ENV["DRIFTWOOD_HMAC_KEY"])
        @host = host
        @hmac_key = hmac_key
        @faraday_options = {
          open_timeout: 1,
          timeout: 5,
          params_encoder: Faraday::FlatParamsEncoder
        }.merge(faraday_options)
      end

      def org_query(org_id:, phrase:, per_page:, public_platform: false, direction: "DESC", limit_history: false, after: "", before: "", region: "", api_request: false, aggregations: false, feature_flags: [], export_request: false, disclose_ip_address: false)
        return Driftwood::TwirpRequest::OrgQuery.new(twirp_client, {
          org_id:,
          phrase:,
          per_page:,
          region:,
          public_platform:,
          direction: sort_direction(direction),
          limit_history:,
          after:,
          before:,
          query_type: :nongit,
          api_request:,
          version: request_version,
          aggregations:,
          feature_flags:,
          export_request:,
          disclose_ip_address:,
        })
      end

      def org_git_query(org_id:, per_page:, after: "", before: "", region: "", phrase: "", api_request: false, direction: "DESC", aggregations: false, feature_flags: [], export_request: false, disclose_ip_address: false)
        return Driftwood::TwirpRequest::OrgQuery.new(twirp_client, {
          org_id:,
          per_page:,
          region:,
          after:,
          before:,
          phrase:,
          query_type: :git,
          api_request:,
          direction: sort_direction(direction),
          version: request_version,
          aggregations:,
          feature_flags:,
          export_request:,
          disclose_ip_address:,
        })
      end

      def org_all_query(org_id:, per_page:, after: "", before: "", region: "", phrase: "", api_request: false, direction: "DESC", aggregations: false, feature_flags: [], export_request: false, disclose_ip_address: false)
        return Driftwood::TwirpRequest::OrgQuery.new(twirp_client, {
          org_id:,
          per_page:,
          after:,
          before:,
          region:,
          phrase:,
          query_type: :all,
          api_request:,
          direction: sort_direction(direction),
          version: request_version,
          aggregations:,
          feature_flags:,
          export_request:,
          disclose_ip_address:,
        })
      end

      def business_query(business_id:, phrase:, per_page:, after: "", before: "", region: "", api_request: false, direction: "DESC", feature_flags: [], export_request: false, disclose_ip_address: false)
        return Driftwood::TwirpRequest::BusinessQuery.new(twirp_client, {
          business_id:,
          phrase:,
          per_page:,
          region:,
          after:,
          before:,
          query_type: :nongit,
          api_request:,
          direction: sort_direction(direction),
          version: request_version,
          feature_flags:,
          export_request:,
          disclose_ip_address:,
        })
      end

      def emu_query(business_id:, per_page:, after: "", before: "", region: "", phrase: "", api_request: false, direction: "DESC", feature_flags: [], export_request: false, disclose_ip_address: false)
        return Driftwood::TwirpRequest::EmuQuery.new(twirp_client, {
          business_id:,
          phrase:,
          per_page:,
          region:,
          after:,
          before:,
          query_type: :nongit,
          api_request:,
          direction: sort_direction(direction),
          version: request_version,
          feature_flags:,
          export_request:,
          disclose_ip_address:,
        })
      end

      def business_git_query(business_id:, per_page:, after: "", before: "", region: "", phrase: "", api_request: false, direction: "DESC", feature_flags: [], export_request: false, disclose_ip_address: false)
        return Driftwood::TwirpRequest::BusinessQuery.new(twirp_client, {
          business_id:,
          per_page:,
          region:,
          after:,
          before:,
          phrase:,
          query_type: :git,
          api_request:,
          direction: sort_direction(direction),
          version: request_version,
          feature_flags:,
          export_request:,
          disclose_ip_address:,
        })
      end

      def business_api_query(business_id:, per_page:, after: "", before: "", region: "", phrase: "", api_request: false, direction: "DESC", feature_flags: [], export_request: false, disclose_ip_address: false)
        return Driftwood::TwirpRequest::BusinessQuery.new(twirp_client, {
          business_id:,
          per_page:,
          region:,
          after:,
          before:,
          phrase:,
          query_type: :api,
          api_request:,
          direction: sort_direction(direction),
          version: request_version,
          feature_flags:,
          export_request:,
          disclose_ip_address:,
        })
      end

      def emu_git_query(business_id:, per_page:, after: "", before: "", region: "", phrase: "", api_request: false, direction: "DESC", feature_flags: [], export_request: false, disclose_ip_address: false)
        return Driftwood::TwirpRequest::EmuQuery.new(twirp_client, {
          business_id:,
          per_page:,
          region:,
          after:,
          before:,
          phrase:,
          query_type: :git,
          api_request:,
          direction: sort_direction(direction),
          version: request_version,
          feature_flags:,
          export_request:,
          disclose_ip_address:,
        })
      end

      def business_all_query(business_id:, per_page:, after: "", before: "", region: "", phrase: "", api_request: false, direction: "DESC", feature_flags: [], export_request: false, disclose_ip_address: false)
        return Driftwood::TwirpRequest::BusinessQuery.new(twirp_client, {
          business_id:,
          per_page:,
          region:,
          after:,
          before:,
          phrase:,
          query_type: :all,
          api_request:,
          direction: sort_direction(direction),
          version: request_version,
          feature_flags:,
          export_request:,
          disclose_ip_address:,
        })
      end

      def emu_all_query(business_id:, per_page:, after: "", before: "", region: "", phrase: "", api_request: false, direction: "DESC", feature_flags: [], export_request: false, disclose_ip_address: false)
        return Driftwood::TwirpRequest::EmuQuery.new(twirp_client, {
          business_id:,
          per_page:,
          region:,
          after:,
          before:,
          phrase:,
          query_type: :all,
          api_request:,
          direction: sort_direction(direction),
          version: request_version,
          feature_flags:,
          export_request:,
          disclose_ip_address:,
        })
      end

      def user_query(user_id:, per_page:, phrase: "", after: "", before: "", region: "", allowlist: [], api_request: false, feature_flags: [], export_request: false, non_sso_org_ids: [])
        return Driftwood::TwirpRequest::UserQuery.new(twirp_client, {
          user_id:,
          per_page:,
          region:,
          allowlist:,
          phrase:,
          after:,
          before:,
          api_request:,
          version: request_version,
          feature_flags:,
          export_request:,
          non_sso_org_ids:,
        })
      end

      def dormant_user_query(user_id:, per_page:, after: "", before: "", region: "", feature_flags: [])
        return Driftwood::TwirpRequest::UserDormancyQuery.new(twirp_client, {
          user_id:,
          per_page:,
          region:,
          after:,
          before:,
          version: request_version,
          feature_flags:,
        })
      end

      def dormant_business_user_query(user_id:, business_id:)
        return Driftwood::TwirpRequest::BusinessUserDormancyQuery.new(twirp_client, {
          user_id:,
          business_id:,
          version: request_version,
        })
      end

      def user_2fa_query(user_id:, per_page:, after: "", before: "", region: "", feature_flags: [])
        return Driftwood::TwirpRequest::User2FAQuery.new(twirp_client, {
          user_id:,
          per_page:,
          region:,
          after:,
          before:,
          version: request_version,
          feature_flags:,
        })
      end

      def stafftools_query(phrase:, per_page:, after: "", before: "", region: "", feature_flags: [])
        return Driftwood::TwirpRequest::StafftoolsQuery.new(twirp_client, {
          phrase:,
          per_page:,
          region:,
          after:,
          before:,
          version: request_version,
          feature_flags:,
        })
      end

      def async_stafftools_query_start(query_id:, phrase:, per_page:, after:, before:, feature_flags: [])
        return Driftwood::AsyncQueryTwirpRequest::Start.new(twirp_client, {
          query_id:,
          phrase:,
          after:,
          before:,
          per_page:,
          feature_flags:,
        })
      end

      def async_stafftools_query_check_status(operation_id:, feature_flags:)
        return Driftwood::AsyncQueryTwirpRequest::Status.new(twirp_client, {
          operation_id:,
          feature_flags:,
        })
      end

      def async_stafftools_query_fetch_results(query_id:, per_page:, after:, before:, feature_flags: [])
        return Driftwood::AsyncQueryTwirpRequest::FetchResults.new(twirp_client, {
          query_id:,
          per_page:,
          after:,
          before:,
          feature_flags:,
        })
      end

      def project_query(project_id:, per_page:, after: "", before: "", region: "", latest_allowed_entry_time: nil, feature_flags: [])
        return Driftwood::TwirpRequest::ProjectQuery.new(twirp_client, {
          project_id:,
          per_page:,
          region:,
          latest_allowed_entry_time:,
          after:,
          before:,
          version: request_version,
          feature_flags:,
        })
      end

      # Start a Git event export job for an organization. Query from start_time
      # to end_time and use the provided token to identify the job.
      def export_org_git(organization_id:, start_time:, end_time:, region: "", token: "", feature_flags: [])
        return Driftwood::ExportTwirpRequest::OrgGit.new(twirp_client, {
          organization_id:,
          start_time:,
          end_time:,
          region:,
          token:,
          version: request_version,
          feature_flags:,
        })
      end

      # Start a Git event export job for a business. Query from start_time
      # to end_time and use the provided token to identify the job.
      def export_business_git(business_id:, start_time:, end_time:, region: "", token: "", feature_flags: [])
        return Driftwood::ExportTwirpRequest::BusinessGit.new(twirp_client, {
          business_id:,
          start_time:,
          end_time:,
          region:,
          token:,
          version: request_version,
          feature_flags:,
        })
      end

      # Fetch the results for a Git event export job.
      #
      # Parameters:
      #
      #   id                - organzation or business id
      #   only_check_state  - boolean to tell whether we only want to check the state
      #                       and not download the zip file
      #   token             - token that identifies the job
      #   region            - region where this export job takes place
      #
      # Returns a hash that contains:
      #
      #   finished          - whether the job is complete
      #   successful        - whether the job finished successfully
      #   json_zip          - the zip file containing the results if only_check_state=false
      #
      def export_fetch_results(id:, only_check_state:, region: "", token: "", feature_flags: [])
        return Driftwood::ExportTwirpRequest::ResultsGit.new(twirp_client, {
          id:,
          region:,
          token:,
          only_check_state:,
          version: request_version,
          feature_flags:,
        })
      end

      # Start a Git event export job for an organization. Query from start_time
      # to end_time and use the provided token to identify the job.
      def export_org_git_v2(organization_id:, start_time:, end_time:, region: "", token: "", feature_flags: [])
        return Driftwood::ExportTwirpRequest::OrgGitV2.new(twirp_client, {
          organization_id:,
          start_time:,
          end_time:,
          region:,
          token:,
          version: request_version,
          feature_flags:,
        })
      end

      # Start a Git event export job for a business. Query from start_time
      # to end_time and use the provided token to identify the job.
      def export_business_git_v2(business_id:, start_time:, end_time:, region: "", token: "", feature_flags: [])
        return Driftwood::ExportTwirpRequest::BusinessGitV2.new(twirp_client, {
          business_id:,
          start_time:,
          end_time:,
          region:,
          token:,
          version: request_version,
          feature_flags:,
        })
      end

      # Fetch the results for a Git event export job.
      #
      # Parameters:
      #
      #   id                - organzation or business id
      #   only_check_state  - boolean to tell whether we only want to check the state
      #                       and not download the zip file
      #   token             - token that identifies the job
      #   chunk_id          - chunk ID to fetch
      #   region            - region where this export job takes place
      #
      # Returns a hash that contains:
      #
      #   finished          - whether the job is complete
      #   successful        - whether the job finished successfully
      #   json_gzip         - the gzip file containing the chunk if only_check_state=false
      #
      def export_fetch_results_v2(id:, only_check_state:, region: "", token: "", chunk_id: 0, feature_flags: [])
        return Driftwood::ExportTwirpRequest::ResultsGitV2.new(twirp_client, {
          id:,
          region:,
          token:,
          only_check_state:,
          chunk_id:,
          version: request_version,
          feature_flags:,
        })
      end

      def get_audit_entry(id:, feature_flags: [])
        return Driftwood::TwirpRequest::GetAuditEntry.new(twirp_client, {
          document_id: id,
          feature_flags:,
        })
      end

      def stream_splunk_check(subject_id:, domain:, port:, key_id:, encrypted_token:, ssl_verify:)
        return Driftwood::StreamTwirpRequest::SplunkCheck.new(streaming_twirp_client,
          subject_id:,
          domain:,
          port:,
          key_id:,
          encrypted_token:,
          ssl_verify:,
        )
      end

      def stream_azure_hubs_check(subject_id:, name:, key_id:, encrypted_connstring:)
        return Driftwood::StreamTwirpRequest::AzureHubsCheck.new(streaming_twirp_client,
          subject_id:,
          name:,
          key_id:,
          encrypted_connstring:,
        )
      end

      def stream_azure_blob_check(subject_id:, key_id:, encrypted_sas_url:)
        return Driftwood::StreamTwirpRequest::AzureBlobCheck.new(streaming_twirp_client,
          subject_id:,
          key_id:,
          encrypted_sas_url:,
        )
      end

      def stream_s3_access_keys_check(subject_id:, bucket:, key_id:, encrypted_access_key_id:, encrypted_secret_key:, region:)
        return Driftwood::StreamTwirpRequest::S3Check.new(streaming_twirp_client,
          subject_id:,
          bucket:,
          key_id:,
          authentication_type: Driftwood::Streaming::V1::StreamS3CheckRequest::AuthenticationType::AUTHENTICATION_TYPE_ACCESS_KEYS,
          encrypted_access_key_id:,
          encrypted_secret_key:,
          region:,
        )
      end

      def stream_s3_oidc_check(subject_id:, subject_name:, bucket:, arn_role:, region:)
        return Driftwood::StreamTwirpRequest::S3Check.new(streaming_twirp_client,
          subject_id:,
          subject_name:,
          bucket:,
          authentication_type: Driftwood::Streaming::V1::StreamS3CheckRequest::AuthenticationType::AUTHENTICATION_TYPE_OIDC_AUDIT_LOG,
          arn_role:,
          region:,
        )
      end

      def stream_gcp_storage_check(subject_id:, bucket:, key_id:, encrypted_json_credentials:)
        return Driftwood::StreamTwirpRequest::GcpStorageCheck.new(streaming_twirp_client,
          subject_id:,
          bucket:,
          key_id:,
          encrypted_json_credentials:,
        )
      end

      def stream_syslog_check(subject_id:, protocol_type:, server_address:, peer_tls_cert:)
        return Driftwood::StreamTwirpRequest::SyslogCheck.new(streaming_twirp_client,
          subject_id:,
          protocol_type:,
          server_address:,
          peer_tls_cert:,
        )
      end

      def stream_datadog_check(subject_id:, site:, key_id:, encrypted_token:)
        return Driftwood::StreamTwirpRequest::DatadogCheck.new(streaming_twirp_client,
          subject_id:,
          site:,
          key_id:,
          encrypted_token:,
        )
      end

      def stream_status(subject_id:)
        return Driftwood::StreamTwirpRequest::Status.new(streaming_twirp_client, subject_id:)
      end

      def export_start_web(subject_id:, subject_type:, format_type:, export_id:, key_id:, encrypted_phrase:, disclose_ip_address: false, feature_flags: [], non_sso_org_ids: [])
        return Driftwood::ExportsTwirpRequest::Start.new(exports_twirp_client,
          export_type: WEB_EXPORT,
          subject_id:,
          subject_type:,
          format_type:,
          export_id:,
          key_id:,
          encrypted_phrase:,
          disclose_ip_address:,
          feature_flags:,
          non_sso_org_ids:,
        )
      end

      def export_check_web_status(subject_id:, subject_type:, format_type:, export_id:, feature_flags: [])
        return Driftwood::ExportsTwirpRequest::CheckStatus.new(exports_twirp_client,
          export_type: WEB_EXPORT,
          subject_id:,
          subject_type:,
          format_type:,
          export_id:,
          feature_flags:,
        )
      end

      def export_fetch_web_result(subject_id:, subject_type:, format_type:, export_id:, chunk_idx:, feature_flags: [])
        return Driftwood::ExportsTwirpRequest::FetchResult.new(exports_twirp_client,
          export_type: WEB_EXPORT,
          subject_id:,
          subject_type:,
          format_type:,
          export_id:,
          chunk_idx:,
          feature_flags:,
        )
      end

      def export_start_git(subject_id:, subject_type:, format_type:, export_id:, key_id:, encrypted_phrase:, disclose_ip_address: false, feature_flags: [])
        return Driftwood::ExportsTwirpRequest::Start.new(exports_twirp_client,
          export_type: GIT_EXPORT,
          subject_id:,
          subject_type:,
          format_type:,
          export_id:,
          key_id:,
          encrypted_phrase:,
          disclose_ip_address:,
          feature_flags:,
        )
      end

      def export_check_git_status(subject_id:, subject_type:, format_type:, export_id:, feature_flags: [])
        return Driftwood::ExportsTwirpRequest::CheckStatus.new(exports_twirp_client,
          export_type: GIT_EXPORT,
          subject_id:,
          subject_type:,
          format_type:,
          export_id:,
          feature_flags:,
        )
      end

      def export_fetch_git_result(subject_id:, subject_type:, format_type:, export_id:, chunk_idx:, feature_flags: [])
        return Driftwood::ExportsTwirpRequest::FetchResult.new(exports_twirp_client,
          export_type: GIT_EXPORT,
          subject_id:,
          subject_type:,
          format_type:,
          export_id:,
          chunk_idx:,
          feature_flags:,
        )
      end


      private

      def twirp_client
        Driftwood::Auditlog::V1::AuditLogClient.new(faraday)
      end

      def streaming_twirp_client
        Driftwood::Streaming::V1::StreamingClient.new(faraday)
      end

      def exports_twirp_client
        Driftwood::Exports::V1::ExportsClient.new(faraday)
      end

      def faraday
        Faraday.new([@host, "twirp"].join("/")) do |conn|
          conn.options.merge! @faraday_options
          conn.use Driftwood::V1::Client::HMACMiddleware, @hmac_key
          conn.adapter(Faraday.default_adapter)
        end
      end

      def sort_direction(direction)
        direction.try(:upcase) == "ASC" ?
          Driftwood::Auditlog::V1::SortDirection::SORT_DIRECTION_ASC :
          Driftwood::Auditlog::V1::SortDirection::SORT_DIRECTION_DESC
      end

      def request_version
        :v1
      end
    end
  end
end
