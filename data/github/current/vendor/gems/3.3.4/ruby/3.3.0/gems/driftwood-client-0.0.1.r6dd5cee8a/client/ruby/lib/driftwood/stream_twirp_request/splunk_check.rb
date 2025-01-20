# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module StreamTwirpRequest
    class SplunkCheck
      include Driftwood::StreamTwirpRequest

      def build_request(options)
        klass = get_request_class("StreamSplunkCheck")

        klass.new(
          subject_id: options[:subject_id],
          domain: options[:domain],
          port: options[:port],
          key_id: options[:key_id],
          encrypted_token: options[:encrypted_token],
          ssl_verify: options[:ssl_verify],
        )
      end

      def client_method
        :stream_splunk_check
      end
    end
  end
end
