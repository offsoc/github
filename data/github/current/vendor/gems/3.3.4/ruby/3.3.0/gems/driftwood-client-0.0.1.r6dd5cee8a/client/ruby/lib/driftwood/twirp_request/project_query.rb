# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module TwirpRequest
    class ProjectQuery
      include Driftwood::TwirpRequest

      def build_request(options)
        klass = get_request_class("ProjectAuditEntries")

        klass.new(
          project_id: options[:project_id],
          per_page: options[:per_page],
          region: {country: options[:region]},
          latest_allowed_entry_time: options[:latest_allowed_entry_time],
          after: options[:after],
          before: options[:before],
          feature_flags: options[:feature_flags],
        )
      end

      def client_method
        :query_project_audit_entries
      end
    end
  end
end
