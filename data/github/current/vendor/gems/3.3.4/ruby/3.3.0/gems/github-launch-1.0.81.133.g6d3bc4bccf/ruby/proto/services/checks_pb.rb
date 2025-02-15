# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: services/checks.proto

require 'google/protobuf'

require 'pbtypes/github_pb'
require 'pbtypes/checks_pb'
require 'google/protobuf/timestamp_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("services/checks.proto", :syntax => :proto3) do
    add_message "git_hub.launch.services.checks.StepsFromChangeIDRequest" do
      optional :change_id, :int64, 1
      optional :repository_id, :message, 2, "git_hub.launch.pbtypes.git_hub.Identity"
      optional :job_id, :string, 3
      optional :plan_id, :string, 4
    end
    add_message "git_hub.launch.services.checks.StepsFromChangeIDResponse" do
      repeated :steps, :message, 1, "git_hub.launch.pbtypes.checks.CheckStep"
    end
    add_message "git_hub.launch.services.checks.SummaryExchangeURLRequest" do
      optional :unauthenticated_job_summaries_url, :string, 1
      optional :repository_id, :message, 2, "git_hub.launch.pbtypes.git_hub.Identity"
    end
    add_message "git_hub.launch.services.checks.SummaryExchangeURLResponse" do
      optional :authenticated_url, :string, 1
      optional :expires_at, :message, 2, "google.protobuf.Timestamp"
    end
    add_message "git_hub.launch.services.checks.StepsFromChangeIDForRunRequest" do
      optional :change_id, :int64, 1
      optional :repository_id, :message, 2, "git_hub.launch.pbtypes.git_hub.Identity"
      optional :plan_id, :string, 3
    end
    add_message "git_hub.launch.services.checks.JobSteps" do
      optional :job_id, :string, 1
      repeated :steps, :message, 2, "git_hub.launch.pbtypes.checks.CheckStep"
    end
    add_message "git_hub.launch.services.checks.StepsFromChangeIDForRunResponse" do
      repeated :job_steps, :message, 1, "git_hub.launch.services.checks.JobSteps"
    end
  end
end

module GitHub
  module Launch
    module Services
      module Checks
        StepsFromChangeIDRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.services.checks.StepsFromChangeIDRequest").msgclass
        StepsFromChangeIDResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.services.checks.StepsFromChangeIDResponse").msgclass
        SummaryExchangeURLRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.services.checks.SummaryExchangeURLRequest").msgclass
        SummaryExchangeURLResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.services.checks.SummaryExchangeURLResponse").msgclass
        StepsFromChangeIDForRunRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.services.checks.StepsFromChangeIDForRunRequest").msgclass
        JobSteps = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.services.checks.JobSteps").msgclass
        StepsFromChangeIDForRunResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.services.checks.StepsFromChangeIDForRunResponse").msgclass
      end
    end
  end
end
