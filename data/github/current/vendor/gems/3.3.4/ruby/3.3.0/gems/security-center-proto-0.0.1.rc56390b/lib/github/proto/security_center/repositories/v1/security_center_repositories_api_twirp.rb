# Code generated by protoc-gen-twirp_ruby 1.6.0, DO NOT EDIT.
require 'twirp'
require_relative 'security_center_repositories_api_pb.rb'

module GitHub
  module Proto
    module SecurityCenter
      module Repositories
        module V1
          class RepositoryAPIService < Twirp::Service
            package 'github.securitycenter.repositories.v1'
            service 'RepositoryAPI'
            rpc :FindRepositories, FindRepositoriesRequest, FindRepositoriesResponse, :ruby_method => :find_repositories
          end

          class RepositoryAPIClient < Twirp::Client
            client_for RepositoryAPIService
          end
        end
      end
    end
  end
end
