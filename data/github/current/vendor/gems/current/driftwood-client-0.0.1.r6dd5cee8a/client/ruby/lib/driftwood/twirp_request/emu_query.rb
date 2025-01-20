# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"
require_relative "business_query"

module Driftwood
  module TwirpRequest
    class EmuQuery
      include Driftwood::TwirpRequest

      def build_request(options)
        @query_type = options.delete(:query_type) || :nongit
        # we use the same request class as the Business Query
        klass = get_request_class("BusinessAuditEntries")

        opts = {
          business_id: options[:business_id],
          phrase: options[:phrase],
          per_page: options[:per_page],
          region: {country: options[:region]},
          after: options[:after],
          before: options[:before],
          api_request: options[:api_request],
          direction: options[:direction],
          feature_flags: options[:feature_flags],
          export_request: options[:export_request],
          disclose_ip_address: options[:disclose_ip_address],
        }

        # we use the same request class as the Business Query
        if @query_type == :git
          klass = get_request_class("BusinessGitAuditEntries")
        elsif @query_type == :all
          klass = get_request_class("BusinessAllAuditEntries")
        end

        klass.new(opts)
      end

      def client_method
        if @query_type == :git
          :query_emu_git_audit_entries
        elsif @query_type == :all
          :query_emu_all_audit_entries
        else
          :query_emu_audit_entries
        end
      end
    end
  end
end
