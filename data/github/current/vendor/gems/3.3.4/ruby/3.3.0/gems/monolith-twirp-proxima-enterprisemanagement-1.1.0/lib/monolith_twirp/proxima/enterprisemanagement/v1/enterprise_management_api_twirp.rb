# Code generated by protoc-gen-twirp_ruby 1.5.0, DO NOT EDIT.
require 'twirp'
require_relative 'enterprise_management_api_pb.rb'

module MonolithTwirp
  module Proxima
    module EnterpriseManagement
      module V1
        class EnterpriseManagementAPIService < Twirp::Service
          package 'proxima.enterprisemanagement.v1'
          service 'EnterpriseManagementAPI'
          rpc :ValidateEnterprise, ValidateEnterpriseRequest, ValidateEnterpriseResponse, :ruby_method => :validate_enterprise
          rpc :CreateEnterprise, CreateEnterpriseRequest, CreateEnterpriseResponse, :ruby_method => :create_enterprise
        end

        class EnterpriseManagementAPIClient < Twirp::Client
          client_for EnterpriseManagementAPIService
        end
      end
    end
  end
end
