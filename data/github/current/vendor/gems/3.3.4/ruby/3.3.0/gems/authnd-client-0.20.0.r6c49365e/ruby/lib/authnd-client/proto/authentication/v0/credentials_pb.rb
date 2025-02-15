# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: authentication/v0/credentials.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("authentication/v0/credentials.proto", :syntax => :proto3) do
    add_message "github.authentication.v0.Credentials" do
      oneof :kind do
        optional :login_password, :message, 1, "github.authentication.v0.LoginPassword"
        optional :ssh_public_key, :message, 4, "github.authentication.v0.SSHPublicKey"
        optional :signed_auth_token, :message, 5, "github.authentication.v0.SignedAuthToken"
        optional :access_token, :message, 6, "github.authentication.v0.AccessToken"
      end
    end
    add_message "github.authentication.v0.LoginPassword" do
      optional :login, :string, 1
      optional :password, :string, 2
    end
    add_message "github.authentication.v0.SSHPublicKey" do
      optional :key, :string, 1
    end
    add_message "github.authentication.v0.SignedAuthToken" do
      optional :token, :string, 1
      optional :scope, :string, 2
    end
    add_message "github.authentication.v0.AccessToken" do
      optional :token, :string, 1
    end
  end
end

module Authnd
  module Proto
    Credentials = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.authentication.v0.Credentials").msgclass
    LoginPassword = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.authentication.v0.LoginPassword").msgclass
    SSHPublicKey = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.authentication.v0.SSHPublicKey").msgclass
    SignedAuthToken = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.authentication.v0.SignedAuthToken").msgclass
    AccessToken = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.authentication.v0.AccessToken").msgclass
  end
end
