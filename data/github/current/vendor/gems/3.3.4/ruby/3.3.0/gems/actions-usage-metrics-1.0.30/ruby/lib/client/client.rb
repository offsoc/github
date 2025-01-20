require_relative './request_signing_middleware'
require_relative '../proto/usage_twirp'
require_relative './version'
require 'faraday'

module ActionsUsageMetrics
  class Client
    attr_reader :connection

    def initialize(host:, hmac_key:, path_prefix: 'twirp')
      @host = host
      @url = [@host.chomp('/'), *path_prefix.split('/').reject { |s| s.nil? || s == '' }].join('/')
      @hmac_key = hmac_key

      @connection = setup_default_connection
      @usage_api = ActionsUsageMetrics::Api::V1::UsageApiClient.new(connection)
    end

    def get_usage_by_repo_workflow_runner(request:)
      unless request.is_a?(ActionsUsageMetrics::Api::V1::GetUsageByRepoWorkflowRunnerRequest)
        raise "Unexpected request: #{request}"
      end

      response = @usage_api.get_usage_by_repo_workflow_runner(request)
      raise response.error.to_s if response.error.is_a?(Twirp::Error)
      unless response.data.is_a?(ActionsUsageMetrics::Api::V1::GetUsageByRepoWorkflowRunnerResponse)
        raise "Unexpected response: #{response}"
      end

      response
    end

    def get_job_usage(request:)
      unless request.is_a?(ActionsUsageMetrics::Api::V1::GetJobUsageRequest)
        raise "Unexpected request: #{request}"
      end

      response = @usage_api.get_job_usage(request)
      raise response.error.to_s if response.error.is_a?(Twirp::Error)
      unless response.data.is_a?(ActionsUsageMetrics::Api::V1::GetJobUsageResponse)
        raise "Unexpected response: #{response}"
      end

      response
    end

    def get_repo_usage(request:)
      unless request.is_a?(ActionsUsageMetrics::Api::V1::GetRepoUsageRequest)
        raise "Unexpected request: #{request}"
      end

      response = @usage_api.get_repo_usage(request)
      raise response.error.to_s if response.error.is_a?(Twirp::Error)
      unless response.data.is_a?(ActionsUsageMetrics::Api::V1::GetRepoUsageResponse)
        raise "Unexpected response: #{response}"
      end

      response
    end

    def get_runner_runtime_usage(request:)
      unless request.is_a?(ActionsUsageMetrics::Api::V1::GetRunnerRuntimeUsageRequest)
        raise "Unexpected request: #{request}"
      end

      response = @usage_api.get_runner_runtime_usage(request)
      raise response.error.to_s if response.error.is_a?(Twirp::Error)
      unless response.data.is_a?(ActionsUsageMetrics::Api::V1::GetRunnerRuntimeUsageResponse)
        raise "Unexpected response: #{response}"
      end

      response
    end

    def get_runner_type_usage(request:)
      unless request.is_a?(ActionsUsageMetrics::Api::V1::GetRunnerTypeUsageRequest)
        raise "Unexpected request: #{request}"
      end

      response = @usage_api.get_runner_type_usage(request)
      raise response.error.to_s if response.error.is_a?(Twirp::Error)
      unless response.data.is_a?(ActionsUsageMetrics::Api::V1::GetRunnerTypeUsageResponse)
        raise "Unexpected response: #{response}"
      end

      response
    end

    def get_workflow_performance(request:)
      unless request.is_a?(ActionsUsageMetrics::Api::V1::GetWorkflowPerformanceRequest)
        raise "Unexpected request: #{request}"
      end

      response = @usage_api.get_workflow_performance(request)
      raise response.error.to_s if response.error.is_a?(Twirp::Error)
      unless response.data.is_a?(ActionsUsageMetrics::Api::V1::GetWorkflowPerformanceResponse)
        raise "Unexpected response: #{response}"
      end

      response
    end

    def get_workflows(request:)
      unless request.is_a?(ActionsUsageMetrics::Api::V1::GetWorkflowsRequest)
        raise "Unexpected request: #{request}"
      end

      response = @usage_api.get_workflows(request)
      raise response.error.to_s if response.error.is_a?(Twirp::Error)
      unless response.data.is_a?(ActionsUsageMetrics::Api::V1::GetWorkflowsResponse)
        raise "Unexpected response: #{response}"
      end

      response
    end

    def get_jobs(request:)
      unless request.is_a?(ActionsUsageMetrics::Api::V1::GetJobsRequest)
        raise "Unexpected request: #{request}"
      end

      response = @usage_api.get_jobs(request)
      raise response.error.to_s if response.error.is_a?(Twirp::Error)
      unless response.data.is_a?(ActionsUsageMetrics::Api::V1::GetJobsResponse)
        raise "Unexpected response: #{response}"
      end

      response
    end

    def get_usage_summary(request:)
      unless request.is_a?(ActionsUsageMetrics::Api::V1::GetUsageSummaryRequest)
        raise "Unexpected request: #{request}"
      end

      response = @usage_api.get_usage_summary(request)
      raise response.error.to_s if response.error.is_a?(Twirp::Error)
      unless response.data.is_a?(ActionsUsageMetrics::Api::V1::GetUsageSummaryResponse)
        raise "Unexpected response: #{response}"
      end

      response
    end

    def get_performance_summary(request:)
      unless request.is_a?(ActionsUsageMetrics::Api::V1::GetPerformanceSummaryRequest)
        raise "Unexpected request: #{request}"
      end

      response = @usage_api.get_performance_summary(request)
      raise response.error.to_s if response.error.is_a?(Twirp::Error)
      unless response.data.is_a?(ActionsUsageMetrics::Api::V1::GetPerformanceSummaryResponse)
        raise "Unexpected response: #{response}"
      end

      response
    end

    def start_export(request:)
      unless request.is_a?(ActionsUsageMetrics::Api::V1::StartExportRequest)
        raise "Unexpected request: #{request}"
      end

      response = @usage_api.start_export(request)
      raise response.error.to_s if response.error.is_a?(Twirp::Error)
      unless response.data.is_a?(ActionsUsageMetrics::Api::V1::StartExportResponse)
        raise "Unexpected response: #{response}"
      end

      response
    end

    def get_export_status(request:)
      unless request.is_a?(ActionsUsageMetrics::Api::V1::GetExportStatusRequest)
        raise "Unexpected request: #{request}"
      end

      response = @usage_api.get_export_status(request)
      raise response.error.to_s if response.error.is_a?(Twirp::Error)
      unless response.data.is_a?(ActionsUsageMetrics::Api::V1::GetExportStatusResponse)
        raise "Unexpected response: #{response}"
      end

      response
    end

    private

    def setup_default_connection
      Faraday.new(url: @url) do |conn|
        conn.headers = conn.headers.merge(default_headers)
        conn.use ActionsUsageMetrics::RequestSigningMiddleware, @hmac_key
        conn.adapter Faraday.default_adapter
      end
    end

    def default_headers
      { 'User-Agent' => "ActionsUsageMetrics client v#{ActionsUsageMetrics::VERSION}" }
    end
  end
end
