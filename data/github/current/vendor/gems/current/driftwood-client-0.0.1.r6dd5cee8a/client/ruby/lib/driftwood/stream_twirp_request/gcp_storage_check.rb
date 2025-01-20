# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module StreamTwirpRequest
    class GcpStorageCheck
      include Driftwood::StreamTwirpRequest

      def build_request(options)
        klass = get_request_class("StreamGcpStorageCheck")

        klass.new(
          subject_id: options[:subject_id],
          bucket: options[:bucket],
          key_id: options[:key_id],
          encrypted_json_credentials: options[:encrypted_json_credentials],
        )
      end

      def client_method
        :stream_gcp_storage_check
      end
    end
  end
end
