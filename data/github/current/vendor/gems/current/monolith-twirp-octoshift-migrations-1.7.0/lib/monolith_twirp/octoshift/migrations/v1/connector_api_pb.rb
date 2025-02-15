# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: migrations/v1/connector_api.proto

require 'google/protobuf'

require_relative '../../migrations/v1/connector_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("migrations/v1/connector_api.proto", :syntax => :proto3) do
    add_message "octoshift.migrations.v1.CreateConnectorRequest" do
      optional :connector_instance_type, :enum, 1, "octoshift.migrations.v1.ConnectorInstanceType"
      optional :name, :string, 2
      optional :url, :string, 3
      optional :access_token, :string, 4
      optional :owner_id, :int64, 5
      optional :owner_login, :string, 6
      optional :github_pat, :string, 7
    end
    add_message "octoshift.migrations.v1.CreateConnectorResponse" do
      optional :connector, :message, 1, "octoshift.migrations.v1.Connector"
    end
    add_message "octoshift.migrations.v1.ListConnectorsRequest" do
      optional :owner_id, :int64, 1
    end
    add_message "octoshift.migrations.v1.ListConnectorsResponse" do
      repeated :connectors, :message, 1, "octoshift.migrations.v1.Connector"
    end
    add_message "octoshift.migrations.v1.GetConnectorRequest" do
      optional :connector_id, :string, 1
      optional :owner_id, :int64, 2
    end
    add_message "octoshift.migrations.v1.GetConnectorResponse" do
      optional :connector, :message, 1, "octoshift.migrations.v1.Connector"
    end
    add_message "octoshift.migrations.v1.DeleteConnectorRequest" do
      optional :connector_id, :string, 1
      optional :owner_id, :int64, 2
    end
    add_message "octoshift.migrations.v1.DeleteConnectorResponse" do
    end
  end
end

module MonolithTwirp
  module Octoshift
    module Migrations
      module V1
        CreateConnectorRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.migrations.v1.CreateConnectorRequest").msgclass
        CreateConnectorResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.migrations.v1.CreateConnectorResponse").msgclass
        ListConnectorsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.migrations.v1.ListConnectorsRequest").msgclass
        ListConnectorsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.migrations.v1.ListConnectorsResponse").msgclass
        GetConnectorRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.migrations.v1.GetConnectorRequest").msgclass
        GetConnectorResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.migrations.v1.GetConnectorResponse").msgclass
        DeleteConnectorRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.migrations.v1.DeleteConnectorRequest").msgclass
        DeleteConnectorResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.migrations.v1.DeleteConnectorResponse").msgclass
      end
    end
  end
end
