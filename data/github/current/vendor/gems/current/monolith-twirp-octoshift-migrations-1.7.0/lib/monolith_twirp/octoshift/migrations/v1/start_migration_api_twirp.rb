# Code generated by protoc-gen-twirp_ruby 1.5.0, DO NOT EDIT.
require 'twirp'
require_relative 'start_migration_api_pb.rb'

module MonolithTwirp
  module Octoshift
    module Migrations
      module V1
        class StartMigrationAPIService < Twirp::Service
          package 'octoshift.migrations.v1'
          service 'StartMigrationAPI'
          rpc :StartMigration, StartMigrationRequest, StartMigrationResponse, :ruby_method => :start_migration
        end

        class StartMigrationAPIClient < Twirp::Client
          client_for StartMigrationAPIService
        end
      end
    end
  end
end
