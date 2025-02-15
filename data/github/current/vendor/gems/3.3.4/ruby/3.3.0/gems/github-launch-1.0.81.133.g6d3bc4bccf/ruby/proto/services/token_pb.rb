# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: services/token.proto

require 'google/protobuf'

require 'google/protobuf/timestamp_pb'
require 'google/protobuf/empty_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("services/token.proto", :syntax => :proto3) do
    add_message "git_hub.launch.services.token.GetTokenRequest" do
      optional :workflow_id, :string, 1
      optional :job_id, :string, 2
      map :permissions, :string, :string, 3
      map :workflow_run_permissions, :string, :string, 4
    end
    add_message "git_hub.launch.services.token.GetTokenResponse" do
      optional :token, :string, 1
      optional :expires_at, :message, 2, "google.protobuf.Timestamp"
      map :permissions, :string, :string, 3
    end
    add_message "git_hub.launch.services.token.RefreshTokenRequest" do
      optional :token, :string, 1
      optional :expires_at, :message, 2, "google.protobuf.Timestamp"
      optional :workflow_id, :string, 3
    end
    add_message "git_hub.launch.services.token.RefreshTokenResponse" do
      optional :token, :string, 1
      optional :expires_at, :message, 2, "google.protobuf.Timestamp"
    end
    add_message "git_hub.launch.services.token.RevokeTokenRequest" do
      optional :token, :string, 1
      optional :workflow_id, :string, 2
    end
    add_message "git_hub.launch.services.token.GetJobPermissionsRequest" do
      optional :plan_id, :string, 1
      map :requested_permissions, :string, :string, 2
    end
    add_message "git_hub.launch.services.token.GetJobPermissionsResponse" do
      map :effective_permissions, :string, :string, 1
    end
  end
end

module GitHub
  module Launch
    module Services
      module Token
        GetTokenRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.services.token.GetTokenRequest").msgclass
        GetTokenResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.services.token.GetTokenResponse").msgclass
        RefreshTokenRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.services.token.RefreshTokenRequest").msgclass
        RefreshTokenResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.services.token.RefreshTokenResponse").msgclass
        RevokeTokenRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.services.token.RevokeTokenRequest").msgclass
        GetJobPermissionsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.services.token.GetJobPermissionsRequest").msgclass
        GetJobPermissionsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("git_hub.launch.services.token.GetJobPermissionsResponse").msgclass
      end
    end
  end
end
