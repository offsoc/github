# Code generated by protoc-gen-twirp_ruby 1.5.0, DO NOT EDIT.
require 'twirp'
require_relative 'workflow_run_executions_api_pb.rb'

module MonolithTwirp
  module Actions
    module Core
      module V1
        class WorkflowRunExecutionsAPIService < Twirp::Service
          package 'actions.core.v1'
          service 'WorkflowRunExecutionsAPI'
          rpc :GetWorkflowRunExecution, GetWorkflowRunExecutionRequest, GetWorkflowRunExecutionResponse, :ruby_method => :get_workflow_run_execution
        end

        class WorkflowRunExecutionsAPIClient < Twirp::Client
          client_for WorkflowRunExecutionsAPIService
        end
      end
    end
  end
end
