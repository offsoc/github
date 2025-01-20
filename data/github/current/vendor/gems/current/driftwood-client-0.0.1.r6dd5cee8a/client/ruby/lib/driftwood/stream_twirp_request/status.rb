# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module StreamTwirpRequest
    class Status
      include Driftwood::StreamTwirpRequest

      def build_request(options)
        klass = get_request_class("StreamStatus")
        klass.new(subject_id: options[:subject_id])
      end

      def client_method
        :stream_status
      end
    end
  end
end
