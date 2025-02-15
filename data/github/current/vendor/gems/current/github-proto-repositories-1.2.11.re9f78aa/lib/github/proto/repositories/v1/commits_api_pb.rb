# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: v1/commits_api.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("v1/commits_api.proto", :syntax => :proto3) do
    add_message "github.repositories.v1.IsReachableCommitRequest" do
      optional :repository_id, :int64, 1
      optional :commit_oid, :string, 2
    end
    add_message "github.repositories.v1.IsReachableCommitResponse" do
      optional :is_reachable, :bool, 1
      optional :did_time_out, :bool, 2
    end
  end
end

module GitHub
  module Proto
    module Repositories
      module V1
        IsReachableCommitRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.repositories.v1.IsReachableCommitRequest").msgclass
        IsReachableCommitResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.repositories.v1.IsReachableCommitResponse").msgclass
      end
    end
  end
end
