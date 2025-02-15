# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: assignments/v1/assignments.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("assignments/v1/assignments.proto", :syntax => :proto3) do
    add_message "classroom.assignments.v1.ExecuteAutogradingWorkflowsRequest" do
      repeated :repo_ids, :int64, 1
      optional :actor_id, :int64, 2
    end
    add_message "classroom.assignments.v1.ExecuteAutogradingWorkflowsResponse" do
    end
  end
end

module MonolithTwirp
  module Classroom
    module Assignments
      module V1
        ExecuteAutogradingWorkflowsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.assignments.v1.ExecuteAutogradingWorkflowsRequest").msgclass
        ExecuteAutogradingWorkflowsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.assignments.v1.ExecuteAutogradingWorkflowsResponse").msgclass
      end
    end
  end
end
