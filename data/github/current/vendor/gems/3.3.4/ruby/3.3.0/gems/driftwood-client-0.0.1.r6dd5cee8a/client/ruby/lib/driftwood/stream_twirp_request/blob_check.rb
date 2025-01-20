# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module StreamTwirpRequest
    class AzureBlobCheck
      include Driftwood::StreamTwirpRequest

      def build_request(options)
        klass = get_request_class("StreamAzureBlobStorageCheck")

        klass.new(
          subject_id: options[:subject_id],
          key_id: options[:key_id],
          encrypted_sas_url: options[:encrypted_sas_url],
        )
      end

      def client_method
        :stream_azure_blob_storage_check
      end
    end
  end
end
