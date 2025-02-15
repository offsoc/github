# Code generated by protoc-gen-twirp_ruby 1.5.0, DO NOT EDIT.
require 'twirp'
require_relative 'actor_api_pb.rb'

module MonolithTwirp
  module Actions
    module Core
      module V1
        class ActorsAPIService < Twirp::Service
          package 'actions.core.v1'
          service 'ActorsAPI'
          rpc :GetActorsInfo, GetActorsInfoRequest, GetActorsInfoResponse, :ruby_method => :get_actors_info
        end

        class ActorsAPIClient < Twirp::Client
          client_for ActorsAPIService
        end
      end
    end
  end
end
