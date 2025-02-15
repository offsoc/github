# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: core/v1/integrations_api.proto

require 'google/protobuf'

require_relative '../../core/v1/dynamic_workflow_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("core/v1/integrations_api.proto", :syntax => :proto3) do
    add_message "actions.core.v1.GetIntegrationJobSecretsRequest" do
      optional :integration_name, :string, 1
      optional :repository_id, :int64, 2
      optional :workflow_run_id, :int64, 3
      optional :bare_job_name, :string, 4
      optional :environment_name, :string, 5
      optional :is_hosted_runner, :bool, 6
      optional :dynamic_workflow, :message, 8, "actions.core.v1.DynamicWorkflow"
    end
    add_message "actions.core.v1.GetIntegrationJobSecretsResponse" do
      map :encrypted_secrets, :string, :string, 1
    end
  end
end

module MonolithTwirp
  module Actions
    module Core
      module V1
        GetIntegrationJobSecretsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actions.core.v1.GetIntegrationJobSecretsRequest").msgclass
        GetIntegrationJobSecretsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actions.core.v1.GetIntegrationJobSecretsResponse").msgclass
      end
    end
  end
end
