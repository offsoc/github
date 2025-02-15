# Code generated by protoc-gen-twirp_ruby 1.5.0, DO NOT EDIT.
require 'twirp'
require_relative 'assignment_reuse_api_pb.rb'

module MonolithTwirp
  module Classroom
    module AssignmentReuse
      module V1
        class AssignmentReuseAPIService < Twirp::Service
          package 'classroom.assignment_reuse.v1'
          service 'AssignmentReuseAPI'
          rpc :CopyStarterCodeRepositoryToOrg, CopyStarterCodeRepositoryToOrgRequest, CopyStarterCodeRepositoryToOrgResponse, :ruby_method => :copy_starter_code_repository_to_org
        end

        class AssignmentReuseAPIClient < Twirp::Client
          client_for AssignmentReuseAPIService
        end
      end
    end
  end
end
