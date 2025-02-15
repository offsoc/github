# Code generated by protoc-gen-twirp_ruby 1.11.0, DO NOT EDIT.
require 'twirp'
require_relative 'export_api_pb.rb'

module ActionsUsageMetrics
  module Api
    module V1
      class ExportApiService < ::Twirp::Service
        package 'actions_usage_metrics.api.v1'
        service 'ExportApi'
        rpc :GetUsageExportUrl, GetUsageExportUrlRequest, GetUsageExportUrlResponse, :ruby_method => :get_usage_export_url
      end

      class ExportApiClient < ::Twirp::Client
        client_for ExportApiService
      end
    end
  end
end
