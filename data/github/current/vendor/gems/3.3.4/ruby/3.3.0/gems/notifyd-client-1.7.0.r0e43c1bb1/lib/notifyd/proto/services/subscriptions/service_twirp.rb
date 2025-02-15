# Code generated by protoc-gen-twirp_ruby 1.11.0, DO NOT EDIT.
require 'twirp'
require_relative 'service_pb.rb'

module Notifyd
  module Proto
    module Subscriptions
      class SubscriptionsService < ::Twirp::Service
        package 'notifyd.api.subscriptions_v2'
        service 'Subscriptions'
        rpc :Get, GetRequest, GetResponse, :ruby_method => :get
        rpc :BatchReplace, BatchReplaceRequest, BatchReplaceResponse, :ruby_method => :batch_replace
        rpc :BatchCreateAndDelete, BatchCreateAndDeleteRequest, BatchCreateAndDeleteResponse, :ruby_method => :batch_create_and_delete
      end

      class SubscriptionsClient < ::Twirp::Client
        client_for SubscriptionsService
      end
    end
  end
end
