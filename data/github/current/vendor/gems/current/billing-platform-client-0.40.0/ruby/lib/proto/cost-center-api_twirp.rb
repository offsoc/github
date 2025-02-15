# Code generated by protoc-gen-twirp_ruby 1.11.0, DO NOT EDIT.
require 'twirp'
require_relative 'cost-center-api_pb.rb'

module BillingPlatform
  module Api
    module V1
      class CostCenterApiService < ::Twirp::Service
        package 'billing_platform.api.v1'
        service 'CostCenterApi'
        rpc :GetAllCostCenters, GetAllCostCentersRequest, GetAllCostCentersResponse, :ruby_method => :get_all_cost_centers
        rpc :GetCostCenter, GetCostCenterRequest, GetCostCenterResponse, :ruby_method => :get_cost_center
        rpc :FindFor, FindCostCenterForRequest, FindCostCenterForResponse, :ruby_method => :find_for
        rpc :CreateCostCenter, CreateCostCenterRequest, CreateCostCenterResponse, :ruby_method => :create_cost_center
        rpc :UpdateCostCenter, UpdateCostCenterRequest, UpdateCostCenterResponse, :ruby_method => :update_cost_center
        rpc :AddResourceTo, AddResourceToCostCenterRequest, AddResourceToCostCenterResponse, :ruby_method => :add_resource_to
        rpc :RemoveResourceFrom, RemoveResourceFromCostCenterRequest, RemoveResourceFromCostCenterResponse, :ruby_method => :remove_resource_from
        rpc :ArchiveCostCenter, ArchiveCostCenterRequest, ArchiveCostCenterResponse, :ruby_method => :archive_cost_center
      end

      class CostCenterApiClient < ::Twirp::Client
        client_for CostCenterApiService
      end
    end
  end
end
