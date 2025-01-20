# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module TwirpRequest
    class UserDormancyQuery
      include Driftwood::TwirpRequest

      def build_request(options)
        klass = get_request_class("UserDormancyAuditEntries")

        klass.new(
          user_id: options[:user_id],
          per_page: options[:per_page],
          region: {country: options[:region]},
          after: options[:after],
          before: options[:before],
          feature_flags: options[:feature_flags],
        )
      end

      def client_method
        :query_user_dormancy_audit_entries
      end
    end
  end
end
