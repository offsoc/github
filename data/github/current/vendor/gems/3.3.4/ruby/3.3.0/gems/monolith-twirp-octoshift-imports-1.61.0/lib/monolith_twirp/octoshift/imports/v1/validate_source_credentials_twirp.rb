# Code generated by protoc-gen-twirp_ruby 1.5.0, DO NOT EDIT.
require 'twirp'
require_relative 'validate_source_credentials_pb.rb'

module MonolithTwirp
  module Octoshift
    module Imports
      module V1
        class ValidateSourceCredentialsAPIService < Twirp::Service
          package 'octoshift.imports.v1'
          service 'ValidateSourceCredentialsAPI'
          rpc :ValidateSourceCredentials, ValidateSourceCredentialsRequest, ValidateSourceCredentialsResponse, :ruby_method => :validate_source_credentials
        end

        class ValidateSourceCredentialsAPIClient < Twirp::Client
          client_for ValidateSourceCredentialsAPIService
        end
      end
    end
  end
end
