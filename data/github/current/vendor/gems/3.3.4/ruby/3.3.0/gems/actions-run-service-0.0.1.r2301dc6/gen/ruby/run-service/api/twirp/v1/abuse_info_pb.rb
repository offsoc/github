# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: run-service/api/twirp/v1/abuse_info.proto

require 'google/protobuf'

require 'run-service/api/twirp/v1/abuse_info_identity_pb'
require 'run-service/api/twirp/v1/target_repository_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("run-service/api/twirp/v1/abuse_info.proto", :syntax => :proto3) do
    add_message "github.actions.run_service.api.twirp.v1.AbuseInfo" do
      optional :workflow_execution_id, :string, 1
      optional :workflow_file_path, :string, 2
      optional :target_repository_tier, :uint32, 3
      optional :trigger_event, :string, 4
      optional :trigger_event_action, :string, 5
      optional :actor, :message, 6, "github.actions.run_service.api.twirp.v1.AbuseInfoIdentity"
      optional :target_repo_owner, :message, 7, "github.actions.run_service.api.twirp.v1.AbuseInfoIdentity"
      optional :billing_plan_owner, :message, 8, "github.actions.run_service.api.twirp.v1.AbuseInfoIdentity"
      optional :target_repository, :message, 9, "github.actions.run_service.api.twirp.v1.TargetRepository"
    end
  end
end

module GitHub
  module ActionsRunService
    module Api
      module Twirp
        module V1
          AbuseInfo = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.actions.run_service.api.twirp.v1.AbuseInfo").msgclass
        end
      end
    end
  end
end
