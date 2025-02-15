# Code generated by protoc-gen-twirp_ruby 1.8.0, DO NOT EDIT.
require 'twirp'
require_relative 'artifacts_exchange_pb.rb'

module GitHub
  module Launch
    module Services
      module Artifactsexchange
        class ActionsArtifactExchangeService < Twirp::Service
          package 'git_hub.launch.services.artifactsexchange'
          service 'ActionsArtifactExchange'
          rpc :ExchangeURL, ExchangeURLRequest, ExchangeURLResponse, :ruby_method => :exchange_u_r_l
          rpc :DeleteArtifact, DeleteArtifactRequest, Google::Protobuf::Empty, :ruby_method => :delete_artifact
          rpc :DeleteBuildLogs, DeleteBuildLogsRequest, Google::Protobuf::Empty, :ruby_method => :delete_build_logs
        end

        class ActionsArtifactExchangeClient < Twirp::Client
          client_for ActionsArtifactExchangeService
        end
      end
    end
  end
end
