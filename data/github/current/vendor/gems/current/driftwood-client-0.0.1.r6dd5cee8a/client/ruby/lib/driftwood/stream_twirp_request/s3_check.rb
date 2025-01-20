# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module StreamTwirpRequest
    class S3Check
      include Driftwood::StreamTwirpRequest

      def build_request(options)
        klass = get_request_class("StreamS3Check")

        klass.new(
          subject_id: options[:subject_id],
          subject_name: options[:subject_name],
          bucket: options[:bucket],
          key_id: options[:key_id],
          authentication_type: options[:authentication_type],
          encrypted_access_key_id: options[:encrypted_access_key_id],
          encrypted_secret_key: options[:encrypted_secret_key],
          arn_role: options[:arn_role],
          region: options[:region],
        )
      end

      def client_method
        :stream_s3_check
      end
    end
  end
end
