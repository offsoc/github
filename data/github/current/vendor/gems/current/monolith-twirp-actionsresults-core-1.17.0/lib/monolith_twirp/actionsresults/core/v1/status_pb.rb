# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: core/v1/status.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("core/v1/status.proto", :syntax => :proto3) do
    add_enum "actionsresults.core.v1.Status" do
      value :STATUS_INVALID, 0
      value :STATUS_REQUESTED, 1
      value :STATUS_QUEUED, 2
      value :STATUS_IN_PROGRESS, 3
      value :STATUS_WAITING, 4
      value :STATUS_PENDING, 5
      value :STATUS_COMPLETED, 6
    end
  end
end

module MonolithTwirp
  module ActionsResults
    module Core
      module V1
        Status = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actionsresults.core.v1.Status").enummodule
      end
    end
  end
end
