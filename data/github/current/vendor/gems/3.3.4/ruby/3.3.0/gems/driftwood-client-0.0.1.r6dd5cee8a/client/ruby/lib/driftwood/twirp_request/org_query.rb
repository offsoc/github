# frozen_string_literal: true

require_relative "../../../lib/twirp/rpc/auditlog/v1/audit_log_twirp"

module Driftwood
  module TwirpRequest
    class OrgQuery
      include Driftwood::TwirpRequest

      def build_request(options)
        @query_type = options.delete(:query_type) || :nongit

        klass = get_request_class("OrganizationAuditEntries")

        opts = {
          phrase: options[:phrase],
          per_page: options[:per_page],
          region: {country: options[:region]},
          direction: options[:direction],
          after: options[:after],
          before: options[:before],
          api_request: options[:api_request],
          aggregations: options.fetch(:aggregations, false),
          feature_flags: options[:feature_flags],
          export_request: options[:export_request],
          disclose_ip_address: options[:disclose_ip_address],
        }

        if @query_type == :git
          klass = get_request_class("OrganizationGitAuditEntries")

          opts = opts.merge({
            organization_id: options[:org_id],
          })
        elsif @query_type == :all
          klass = get_request_class("OrgAllAuditEntries")

          opts = opts.merge({
            org_id: options[:org_id],
          })
        else
          opts = opts.merge({
            organization_id: options[:org_id],
            public_platform: options[:public_platform],
            limit_history: options[:limit_history],
          })
        end

        klass.new(opts)
      end

      def client_method
        if @query_type == :git
          :query_org_git_audit_entries
        elsif @query_type == :all
          :query_org_all_audit_entries
        else
          :query_org_audit_entries
        end
      end
    end
  end
end
