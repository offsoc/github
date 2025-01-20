# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module AsyncQueryTwirpRequest
    class Status
      include Driftwood::AsyncQueryTwirpRequest

      def build_request(options)
        klass = get_request_class("AsyncStafftoolsQueryStatus")

        klass.new(
          operation_id: options[:operation_id],
          feature_flags: options[:feature_flags],
        )
      end

      def client_method
        :get_async_query_stafftools_status
      end
    end
  end
end
