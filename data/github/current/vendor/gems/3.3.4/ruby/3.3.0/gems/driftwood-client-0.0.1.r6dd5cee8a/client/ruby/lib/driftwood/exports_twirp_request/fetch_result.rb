# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module ExportsTwirpRequest
    class FetchResult
      include Driftwood::ExportsTwirpRequest

      def build_request(options)
        klass = get_request_class("FetchResult")

        klass.new(
          export_type: options[:export_type],
          subject_id: options[:subject_id],
          subject_type: options[:subject_type],
          format_type: options[:format_type],
          export_id: options[:export_id],
          chunk_idx: options[:chunk_idx],
          feature_flags: options[:feature_flags],
        )
      end

      def client_method
        :fetch_result
      end
    end
  end
end
