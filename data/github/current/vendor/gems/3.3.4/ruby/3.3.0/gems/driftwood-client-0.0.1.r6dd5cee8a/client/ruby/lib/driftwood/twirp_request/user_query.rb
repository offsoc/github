# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module TwirpRequest
    class UserQuery
      include Driftwood::TwirpRequest

      def build_request(options)
        klass = get_request_class("UserAuditEntries")

        klass.new(
          user_id: options[:user_id],
          per_page: options[:per_page],
          region: {country: options[:region]},
          allowlist: options[:allowlist],
          phrase: options[:phrase],
          after: options[:after],
          before: options[:before],
          api_request: options[:api_request],
          feature_flags: options[:feature_flags],
          export_request: options[:export_request],
          non_sso_org_ids: options[:non_sso_org_ids],
        )
      end

      def client_method
        :query_user_audit_entries
      end
    end
  end
end
