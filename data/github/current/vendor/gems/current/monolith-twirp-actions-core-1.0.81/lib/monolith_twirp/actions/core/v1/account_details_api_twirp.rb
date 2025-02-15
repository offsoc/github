# Code generated by protoc-gen-twirp_ruby 1.5.0, DO NOT EDIT.
require 'twirp'
require_relative 'account_details_api_pb.rb'

module MonolithTwirp
  module Actions
    module Core
      module V1
        class AccountDetailsAPIService < Twirp::Service
          package 'actions.core.v1'
          service 'AccountDetailsAPI'
          rpc :GetAccountDetails, GetAccountDetailsRequest, GetAccountDetailsResponse, :ruby_method => :get_account_details
          rpc :GetAccountDetailsForRepository, GetAccountDetailsForRepositoryRequest, GetAccountDetailsForRepositoryResponse, :ruby_method => :get_account_details_for_repository
        end

        class AccountDetailsAPIClient < Twirp::Client
          client_for AccountDetailsAPIService
        end
      end
    end
  end
end
