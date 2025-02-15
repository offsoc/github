# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: run-service/contracts/v1/environment.proto

require 'google/protobuf'

require 'run-service/contracts/v1/gate_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("run-service/contracts/v1/environment.proto", :syntax => :proto3) do
    add_message "github.actions.run_service.contracts.v1.Environment" do
      optional :global_id, :string, 1
      optional :database_id, :int64, 2
      optional :name, :string, 3
      repeated :gates, :message, 4, "github.actions.run_service.contracts.v1.Gate"
    end
  end
end

module GitHub
  module ActionsRunService
    module Contracts
      module V1
        Environment = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.actions.run_service.contracts.v1.Environment").msgclass
      end
    end
  end
end
