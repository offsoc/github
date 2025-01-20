# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module StreamTwirpRequest
    class SyslogCheck
      include Driftwood::StreamTwirpRequest

      def build_request(options)
        klass = get_request_class("StreamSyslogCheck")

        klass.new(
          subject_id: options[:subject_id],
          protocol_type: options[:protocol_type],
          server_address: options[:server_address],
          peer_tls_cert: options[:peer_tls_cert],
        )
      end

      def client_method
        :stream_syslog_check
      end
    end
  end
end
