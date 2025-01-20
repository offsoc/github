# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module TwirpRequest
    class GetAuditEntry
      include Driftwood::TwirpRequest

      def build_request(options)
        Driftwood::Auditlog::V1::GetAuditEntryRequest.new(
          document_id: options[:document_id],
          feature_flags: options[:feature_flags],
        )
      end

      def client_method
        :get_audit_entry
      end
    end
  end
end
