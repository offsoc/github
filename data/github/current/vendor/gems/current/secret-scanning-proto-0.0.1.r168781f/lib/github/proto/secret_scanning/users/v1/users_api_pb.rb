# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: users/v1/users_api.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("users/v1/users_api.proto", :syntax => :proto3) do
    add_message "github.secretscanning.users.v1.UserListItem" do
      optional :id, :int64, 1
      optional :login, :string, 2
      optional :name, :string, 3
      optional :type, :enum, 4, "github.secretscanning.users.v1.UserType"
      optional :email, :string, 5
    end
    add_message "github.secretscanning.users.v1.IdsSelector" do
      repeated :ids, :uint64, 1
    end
    add_message "github.secretscanning.users.v1.LoginsSelector" do
      repeated :logins, :string, 1
    end
    add_message "github.secretscanning.users.v1.BusinessSelector" do
      optional :id, :uint64, 1
    end
    add_message "github.secretscanning.users.v1.FindUsersRequest" do
      repeated :ids, :int64, 1
      optional :cursor, :bytes, 5
      oneof :selector do
        optional :ids_selector, :message, 2, "github.secretscanning.users.v1.IdsSelector"
        optional :logins_selector, :message, 3, "github.secretscanning.users.v1.LoginsSelector"
        optional :business_selector, :message, 4, "github.secretscanning.users.v1.BusinessSelector"
      end
    end
    add_message "github.secretscanning.users.v1.FindUsersResponse" do
      repeated :users, :message, 1, "github.secretscanning.users.v1.UserListItem"
      optional :next_cursor, :bytes, 2
    end
    add_enum "github.secretscanning.users.v1.UserType" do
      value :USER_TYPE_INVALID, 0
      value :USER_TYPE_USER, 1
      value :USER_TYPE_ORGANIZATION, 2
      value :USER_TYPE_BOT, 3
    end
  end
end

module GitHub
  module Proto
    module SecretScanning
      module Users
        module V1
          UserListItem = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.users.v1.UserListItem").msgclass
          IdsSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.users.v1.IdsSelector").msgclass
          LoginsSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.users.v1.LoginsSelector").msgclass
          BusinessSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.users.v1.BusinessSelector").msgclass
          FindUsersRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.users.v1.FindUsersRequest").msgclass
          FindUsersResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.users.v1.FindUsersResponse").msgclass
          UserType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.secretscanning.users.v1.UserType").enummodule
        end
      end
    end
  end
end
