# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: classroom_codespaces/v1/classroom_codespaces.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("classroom_codespaces/v1/classroom_codespaces.proto", :syntax => :proto3) do
    add_message "classroom.classroom_codespaces.v1.RevokeClassroomCodespacesFromOrganizationRequest" do
      optional :organization_id, :int64, 1
      optional :teacher_id, :int64, 2
    end
    add_message "classroom.classroom_codespaces.v1.RevokeClassroomCodespacesFromOrganizationResponse" do
      optional :organization_id, :int64, 1
      optional :teacher_id, :int64, 2
      optional :is_revoked, :bool, 3
      optional :reason, :string, 4
    end
    add_message "classroom.classroom_codespaces.v1.DisableClassroomCodespacesRequest" do
      optional :organization_id, :int64, 1
      optional :teacher_id, :int64, 2
    end
    add_message "classroom.classroom_codespaces.v1.DisableClassroomCodespacesResponse" do
      optional :organization_id, :int64, 1
      optional :teacher_id, :int64, 2
      optional :is_disabled, :bool, 3
      optional :reason, :string, 4
    end
    add_message "classroom.classroom_codespaces.v1.EnableClassroomCodespacesForOrganizationRequest" do
      optional :organization_id, :int64, 1
      optional :teacher_id, :int64, 2
    end
    add_message "classroom.classroom_codespaces.v1.EnableClassroomCodespacesForOrganizationResponse" do
      optional :organization_id, :int64, 1
      optional :teacher_id, :int64, 2
      optional :is_enabled, :bool, 3
      optional :reason, :string, 4
    end
    add_message "classroom.classroom_codespaces.v1.CheckClassroomCodespacesStatusForOrganizationRequest" do
      optional :organization_id, :int64, 1
    end
    add_message "classroom.classroom_codespaces.v1.CheckClassroomCodespacesStatusForOrganizationResponse" do
      optional :organization_id, :int64, 1
      optional :is_enabled, :bool, 2
      optional :reason, :string, 3
    end
    add_message "classroom.classroom_codespaces.v1.CheckIfOrganizationEligibleForClassroomCodespacesRequest" do
      optional :organization_id, :int64, 1
    end
    add_message "classroom.classroom_codespaces.v1.CheckIfOrganizationEligibleForClassroomCodespacesResponse" do
      optional :organization_id, :int64, 1
      optional :is_eligible, :bool, 2
      optional :reason, :string, 3
    end
    add_message "classroom.classroom_codespaces.v1.CheckTeacherVerifiedStatusRequest" do
      optional :teacher_id, :int64, 1
    end
    add_message "classroom.classroom_codespaces.v1.CheckTeacherVerifiedStatusResponse" do
      optional :teacher_id, :int64, 1
      optional :is_verified, :bool, 2
      optional :reason, :string, 3
    end
  end
end

module MonolithTwirp
  module Classroom
    module ClassroomCodespaces
      module V1
        RevokeClassroomCodespacesFromOrganizationRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.classroom_codespaces.v1.RevokeClassroomCodespacesFromOrganizationRequest").msgclass
        RevokeClassroomCodespacesFromOrganizationResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.classroom_codespaces.v1.RevokeClassroomCodespacesFromOrganizationResponse").msgclass
        DisableClassroomCodespacesRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.classroom_codespaces.v1.DisableClassroomCodespacesRequest").msgclass
        DisableClassroomCodespacesResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.classroom_codespaces.v1.DisableClassroomCodespacesResponse").msgclass
        EnableClassroomCodespacesForOrganizationRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.classroom_codespaces.v1.EnableClassroomCodespacesForOrganizationRequest").msgclass
        EnableClassroomCodespacesForOrganizationResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.classroom_codespaces.v1.EnableClassroomCodespacesForOrganizationResponse").msgclass
        CheckClassroomCodespacesStatusForOrganizationRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.classroom_codespaces.v1.CheckClassroomCodespacesStatusForOrganizationRequest").msgclass
        CheckClassroomCodespacesStatusForOrganizationResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.classroom_codespaces.v1.CheckClassroomCodespacesStatusForOrganizationResponse").msgclass
        CheckIfOrganizationEligibleForClassroomCodespacesRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.classroom_codespaces.v1.CheckIfOrganizationEligibleForClassroomCodespacesRequest").msgclass
        CheckIfOrganizationEligibleForClassroomCodespacesResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.classroom_codespaces.v1.CheckIfOrganizationEligibleForClassroomCodespacesResponse").msgclass
        CheckTeacherVerifiedStatusRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.classroom_codespaces.v1.CheckTeacherVerifiedStatusRequest").msgclass
        CheckTeacherVerifiedStatusResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.classroom_codespaces.v1.CheckTeacherVerifiedStatusResponse").msgclass
      end
    end
  end
end
