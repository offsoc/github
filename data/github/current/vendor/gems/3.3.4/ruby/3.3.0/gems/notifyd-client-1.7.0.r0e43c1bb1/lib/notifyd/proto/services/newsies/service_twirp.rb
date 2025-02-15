# Code generated by protoc-gen-twirp_ruby 1.11.0, DO NOT EDIT.
require 'twirp'
require_relative 'service_pb.rb'

module Notifyd
  module Proto
    module Newsies
      class NewsiesService < ::Twirp::Service
        package 'notifyd.api.newsies'
        service 'Newsies'
        rpc :Watch, WatchRequest, WatchResponse, :ruby_method => :watch
        rpc :Unwatch, UnwatchRequest, UnwatchResponse, :ruby_method => :unwatch
        rpc :Ignore, IgnoreRequest, IgnoreResponse, :ruby_method => :ignore
        rpc :UnwatchAll, UnwatchAllRequest, UnwatchAllResponse, :ruby_method => :unwatch_all
      end

      class NewsiesClient < ::Twirp::Client
        client_for NewsiesService
      end
    end
  end
end
