# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module StreamTwirpRequest
    class DatadogCheck
      include Driftwood::StreamTwirpRequest

      def build_request(options)
        klass = get_request_class("StreamDatadogCheck")

        klass.new(
          subject_id: options[:subject_id],
          site: options[:site],
          key_id: options[:key_id],
          encrypted_token: options[:encrypted_token],
        )
      end

      def client_method
        :stream_datadog_check
      end
    end
  end
end
