# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: v1/user_visibility_result_item.proto

require 'google/protobuf'

require 'v1/reason_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("v1/user_visibility_result_item.proto", :syntax => :proto3) do
    add_message "github.users.v1.UserVisibilityResultItem" do
      optional :user_id, :int64, 1
      optional :is_visible, :bool, 2
      optional :reason, :enum, 3, "github.users.v1.Reason"
    end
  end
end

module GitHub
  module Proto
    module Users
      module V1
        UserVisibilityResultItem = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.users.v1.UserVisibilityResultItem").msgclass
      end
    end
  end
end
