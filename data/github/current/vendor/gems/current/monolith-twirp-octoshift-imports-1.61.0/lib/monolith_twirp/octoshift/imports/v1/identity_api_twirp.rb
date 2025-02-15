# Code generated by protoc-gen-twirp_ruby 1.5.0, DO NOT EDIT.
require 'twirp'
require_relative 'identity_api_pb.rb'

module MonolithTwirp
  module Octoshift
    module Imports
      module V1
        class IdentityAPIService < Twirp::Service
          package 'octoshift.imports.v1'
          service 'IdentityAPI'
          rpc :FindUserIdentity, FindUserIdentityRequest, FindUserIdentityResponse, :ruby_method => :find_user_identity
        end

        class IdentityAPIClient < Twirp::Client
          client_for IdentityAPIService
        end
      end
    end
  end
end
