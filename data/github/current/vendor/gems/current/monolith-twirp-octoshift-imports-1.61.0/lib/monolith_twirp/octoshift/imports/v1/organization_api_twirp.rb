# Code generated by protoc-gen-twirp_ruby 1.5.0, DO NOT EDIT.
require 'twirp'
require_relative 'organization_api_pb.rb'

module MonolithTwirp
  module Octoshift
    module Imports
      module V1
        class OrganizationAPIService < Twirp::Service
          package 'octoshift.imports.v1'
          service 'OrganizationAPI'
          rpc :GetOrganization, GetOrganizationRequest, GetOrganizationResponse, :ruby_method => :get_organization
        end

        class OrganizationAPIClient < Twirp::Client
          client_for OrganizationAPIService
        end
      end
    end
  end
end
