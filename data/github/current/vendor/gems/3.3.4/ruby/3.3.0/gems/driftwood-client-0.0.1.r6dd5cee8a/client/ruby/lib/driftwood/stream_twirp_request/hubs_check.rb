# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module StreamTwirpRequest
    class AzureHubsCheck
      include Driftwood::StreamTwirpRequest

      def build_request(options)
        klass = get_request_class("StreamAzureHubsCheck")

        klass.new(
          subject_id: options[:subject_id],
          name: options[:name],
          key_id: options[:key_id],
          encrypted_connstring: options[:encrypted_connstring],
        )
      end

      def client_method
        :stream_azure_hubs_check
      end
    end
  end
end
