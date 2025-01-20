# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module ExportTwirpRequest
    class BusinessGit
      include Driftwood::ExportTwirpRequest

      def build_request(options)
        klass = get_request_class("ExportBusinessGitAuditEntries")

        klass.new(
          business_id: options[:business_id],
          start_time: options[:start_time],
          end_time: options[:end_time],
          region: {country: options[:region]},
          token: options[:token],
          feature_flags: options[:feature_flags],
        )
      end

      def client_method
        :export_business_git_audit_entries
      end
    end
  end
end
