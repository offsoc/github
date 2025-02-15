# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: api/v1/job_groups.proto

require 'google/protobuf'

require 'types/v1/job_groups_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("api/v1/job_groups.proto", :syntax => :proto3) do
    add_message "github.secretscanning.v1.JobGroupSummaryRequest" do
      optional :job_group_id, :uint64, 1
    end
    add_message "github.secretscanning.v1.JobGroupSummaryResponse" do
      optional :job_group, :message, 1, "github.secretscanning.types.v1.JobGroup"
      optional :total_token_count, :uint64, 2
      optional :repos_scanned_count, :uint64, 3
    end
  end
end

module GitHub
  module Proto
    module SecretScanning
      module Api
        module V1
          JobGroupSummaryRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v1.JobGroupSummaryRequest").msgclass
          JobGroupSummaryResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.v1.JobGroupSummaryResponse").msgclass
        end
      end
    end
  end
end
