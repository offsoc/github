# Code generated by protoc-gen-twirp_ruby 1.11.0, DO NOT EDIT.
require 'twirp'
require_relative 'usage-report-api_pb.rb'

module BillingPlatform
  module Api
    module V1
      class UsageReportApiService < ::Twirp::Service
        package 'billing_platform.api.v1'
        service 'UsageReportApi'
        rpc :GetUsageReport, GetUsageReportRequest, GetUsageReportResponse, :ruby_method => :get_usage_report
        rpc :QueueUsageReportExport, QueueUsageReportExportRequest, QueueUsageReportExportResponse, :ruby_method => :queue_usage_report_export
      end

      class UsageReportApiClient < ::Twirp::Client
        client_for UsageReportApiService
      end
    end
  end
end
