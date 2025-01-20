# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module TwirpRequest
    class BusinessQuery
      include Driftwood::TwirpRequest

      def build_request(options)
        @query_type = options.delete(:query_type) || :nongit

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

        if @query_type == :git
          klass = get_request_class("BusinessGitAuditEntries")
        elsif @query_type == :api
          klass = get_request_class("BusinessAPIAuditEntries")
        elsif @query_type == :all
          klass = get_request_class("BusinessAllAuditEntries")
        end

        klass.new(opts)
      end

      def client_method
        if @query_type == :git
          :query_business_git_audit_entries
        elsif @query_type == :api
          :query_business_api_audit_entries
        elsif @query_type == :all
          :query_business_all_audit_entries
        else
          :query_business_audit_entries
        end
      end
    end
  end
end
