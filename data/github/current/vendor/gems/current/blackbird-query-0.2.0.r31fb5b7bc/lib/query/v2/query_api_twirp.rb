# Code generated by protoc-gen-twirp_ruby 1.9.0, DO NOT EDIT.
require 'twirp'
require_relative 'query_api_pb.rb'

module Blackbird
  module Query
    module V2
      class QueryAPIService < Twirp::Service
        package 'blackbird.query.v2'
        service 'QueryAPI'
        rpc :Query, QueryRequest, QueryResponse, :ruby_method => :query
        rpc :RefreshAuthCaches, RefreshAuthCachesRequest, RefreshAuthCachesResponse, :ruby_method => :refresh_auth_caches
        rpc :WarmCaches, WarmCachesRequest, WarmCachesResponse, :ruby_method => :warm_caches
        rpc :FrontendQuery, FrontendQueryRequest, FrontendQueryResponse, :ruby_method => :frontend_query
        rpc :LegacyQuery, LegacyQueryRequest, LegacyQueryResponse, :ruby_method => :legacy_query
      end

      class QueryAPIClient < Twirp::Client
        client_for QueryAPIService
      end
    end
  end
end
