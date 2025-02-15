# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: pbtypes/deploy.proto

require 'google/protobuf'

require 'google/protobuf/timestamp_pb'
require 'pbtypes/github_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("pbtypes/deploy.proto", :syntax => :proto3) do
    add_message "git_hub.launch.pbtypes.deploy.NotifyRepositoryEvent" do
      optional :repository_node_id, :message, 1, "git_hub.launch.pbtypes.git_hub.Identity"
      optional :repository_id, :int64, 2
      optional :actor_node_id, :string, 3
      optional :actor_login, :string, 4
      optional :installation_id, :int64, 5
      optional :action, :string, 6
      optional :default_branch_changed, :bool, 7
      optional :repository_owner_node_id, :message, 8, "git_hub.launch.pbtypes.git_hub.Identity"
      optional :owner_database_id, :int64, 9
    end
    add_message "git_hub.launch.pbtypes.deploy.DeleteSchedulesRequest" do
      optional :environment, :string, 1
      optional :repository_node_id, :message, 2, "git_hub.launch.pbtypes.git_hub.Identity"
    end
    add_message "git_hub.launch.pbtypes.deploy.DeleteSchedulesResponse" do
      optional :count, :int64, 1
    end
    add_message "git_hub.launch.pbtypes.deploy.ListSchedulesRequest" do
      optional :environment, :string, 1
      optional :repository_node_id, :message, 2, "git_hub.launch.pbtypes.git_hub.Identity"
    end
    add_message "git_hub.launch.pbtypes.deploy.ListSchedulesResponse" do
      repeated :workflow_schedules, :message, 1, "git_hub.launch.pbtypes.deploy.WorkflowSchedule"
    end
    add_message "git_hub.launch.pbtypes.deploy.SynchronizeScheduledWorkflowsRequest" do
      optional :ref, :string, 1
      optional :repository_node_id, :message, 2, "git_hub.launch.pbtypes.git_hub.Identity"
      optional :installation_id, :int64, 3
      optional :actor_node_id, :message, 4, "git_hub.launch.pbtypes.git_hub.Identity"
      optional :owner_database_id, :int64, 5
    end
    add_message "git_hub.launch.pbtypes.deploy.DisableScheduledWorkflowRequest" do
      optional :environment, :string, 1
      optional :repository_node_id, :message, 2, "git_hub.launch.pbtypes.git_hub.Identity"
      optional :workflow_file_path, :string, 3
    end
    add_message "git_hub.launch.pbtypes.deploy.CheckRunDebug" do
      optional :id, :string, 1
      optional :status, :string, 2
      optional :conclusion, :string, 3
      optional :startedAt, :string, 4
      optional :completedAt, :string, 5
      optional :permalink, :string, 6
      optional :displayName, :string, 7
      optional :name, :string, 8
    end
    add_message "git_hub.launch.pbtypes.deploy.WorkflowSchedule" do
      optional :id, :int64, 1
      optional :schedule_hash, :string, 2
      optional :schedule_next_hash, :string, 3
      optional :repository_node_id, :message, 4, "git_hub.launch.pbtypes.git_hub.Identity"
      optional :repository_next_id, :message, 5, "git_hub.launch.pbtypes.git_hub.Identity"
      optional :workflow_identifier, :string, 6
      optional :workflow_file_path, :string, 7
      optional :environment, :string, 8
      optional :schedule, :string, 9
      optional :scatter_offset, :double, 10
      optional :next_run_at, :message, 11, "google.protobuf.Timestamp"
      optional :commit_sha, :string, 12
      optional :actor_node_id, :message, 13, "git_hub.launch.pbtypes.git_hub.Identity"
      optional :actor_next_id, :message, 14, "git_hub.launch.pbtypes.git_hub.Identity"
      optional :actor_login, :string, 15
      optional :created_at, :message, 16, "google.protobuf.Timestamp"
      optional :tier, :int64, 17
      optional :tier_updated_at, :message, 18, "google.protobuf.Timestamp"
      optional :owner_id, :int64, 19
    end
  end
end

module GitHub
  module Launch
    module Pbtypes
      module Deploy
        NotifyRepositoryEvent = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.pbtypes.deploy.NotifyRepositoryEvent").msgclass
        DeleteSchedulesRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.pbtypes.deploy.DeleteSchedulesRequest").msgclass
        DeleteSchedulesResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.pbtypes.deploy.DeleteSchedulesResponse").msgclass
        ListSchedulesRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.pbtypes.deploy.ListSchedulesRequest").msgclass
        ListSchedulesResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.pbtypes.deploy.ListSchedulesResponse").msgclass
        SynchronizeScheduledWorkflowsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.pbtypes.deploy.SynchronizeScheduledWorkflowsRequest").msgclass
        DisableScheduledWorkflowRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.pbtypes.deploy.DisableScheduledWorkflowRequest").msgclass
        CheckRunDebug = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.pbtypes.deploy.CheckRunDebug").msgclass
        WorkflowSchedule = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.pbtypes.deploy.WorkflowSchedule").msgclass
      end
    end
  end
end
