# Code generated by protoc-gen-twirp_ruby 1.9.0, DO NOT EDIT.
require 'twirp'
require_relative 'analysis_api_pb.rb'

module Blackbird
  module Analysis
    module V2
      class AnalysisAPIService < Twirp::Service
        package 'blackbird.analysis.v2'
        service 'AnalysisAPI'
        rpc :GetSymbols, GetSymbolsRequest, GetSymbolsResponse, :ruby_method => :get_symbols
      end

      class AnalysisAPIClient < Twirp::Client
        client_for AnalysisAPIService
      end
    end
  end
end
