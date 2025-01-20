# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module ExportsTwirpRequest
    class Start
      include Driftwood::ExportsTwirpRequest

      def build_request(options)
        klass = get_request_class("Start")

        klass.new(
          export_type: options[:export_type],
          subject_id: options[:subject_id],
          subject_type: options[:subject_type],
          format_type: options[:format_type],
          export_id: options[:export_id],
          key_id: options[:key_id],
          encrypted_phrase: options[:encrypted_phrase],
          disclose_ip_address: options[:disclose_ip_address],
          feature_flags: options[:feature_flags],
          non_sso_org_ids: options[:non_sso_org_ids],
        )
      end

      def client_method
        :start
      end
    end
  end
end
