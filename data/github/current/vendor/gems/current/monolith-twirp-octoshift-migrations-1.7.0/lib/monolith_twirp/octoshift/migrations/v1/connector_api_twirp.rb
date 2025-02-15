# Code generated by protoc-gen-twirp_ruby 1.5.0, DO NOT EDIT.
require 'twirp'
require_relative 'connector_api_pb.rb'

module MonolithTwirp
  module Octoshift
    module Migrations
      module V1
        class ConnectorAPIService < Twirp::Service
          package 'octoshift.migrations.v1'
          service 'ConnectorAPI'
          rpc :CreateConnector, CreateConnectorRequest, CreateConnectorResponse, :ruby_method => :create_connector
          rpc :ListConnectors, ListConnectorsRequest, ListConnectorsResponse, :ruby_method => :list_connectors
          rpc :GetConnector, GetConnectorRequest, GetConnectorResponse, :ruby_method => :get_connector
          rpc :DeleteConnector, DeleteConnectorRequest, DeleteConnectorResponse, :ruby_method => :delete_connector
        end

        class ConnectorAPIClient < Twirp::Client
          client_for ConnectorAPIService
        end
      end
    end
  end
end
