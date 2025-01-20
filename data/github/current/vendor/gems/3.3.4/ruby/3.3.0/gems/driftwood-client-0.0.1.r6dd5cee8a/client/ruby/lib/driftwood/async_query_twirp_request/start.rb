# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module AsyncQueryTwirpRequest
    class Start
      include Driftwood::AsyncQueryTwirpRequest

      def build_request(options)
        klass = get_request_class("AsyncStafftoolsQueryStart")

        klass.new(
          query_id: options[:query_id],
          phrase: options[:phrase],
          per_page: options[:per_page],
          after: options[:after],
          before: options[:before],
          feature_flags: options[:feature_flags],
        )
      end

      def client_method
        :start_async_query_stafftools_audit_entries
      end
    end
  end
end
