# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module ExportTwirpRequest
    class ResultsGit
      include Driftwood::ExportTwirpRequest

      def build_request(options)
        klass = get_request_class("ExportGitAuditEntriesFetch", v2: true)

        klass.new(
          id: options[:id],
          region: {country: options[:region]},
          token: options[:token],
          only_check_state: options[:only_check_state],
          feature_flags: options[:feature_flags],
        )
      end

      def client_method
        :export_git_audit_entries_fetch_v2
      end
    end
  end
end
