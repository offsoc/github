# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: sync_classroom/v1/sync_classroom.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("sync_classroom/v1/sync_classroom.proto", :syntax => :proto3) do
    add_message "classroom.sync_classroom.v1.CreateClassroomClassroomRecordsRequest" do
      optional :id, :int64, 1
      optional :classroom_name, :string, 2
    end
    add_message "classroom.sync_classroom.v1.CreateClassroomClassroomRecordsResponse" do
      optional :id, :int64, 1
      optional :created, :bool, 2
      optional :reason, :string, 3
    end
    add_message "classroom.sync_classroom.v1.DeleteClassroomClassroomRecordsRequest" do
      optional :id, :int64, 1
    end
    add_message "classroom.sync_classroom.v1.DeleteClassroomClassroomRecordsResponse" do
      optional :deleted, :bool, 1
    end
    add_message "classroom.sync_classroom.v1.CreateClassroomAssignmentRecordsRequest" do
      optional :id, :int64, 1
      optional :assignment_name, :string, 2
      optional :classroom_id, :int64, 3
      optional :assignment_type, :string, 4
      optional :starter_code_repository_id, :int64, 5
      optional :has_autograding, :bool, 6
      optional :deadline, :string, 7
    end
    add_message "classroom.sync_classroom.v1.CreateClassroomAssignmentRecordsResponse" do
      optional :id, :int64, 1
      optional :created, :bool, 2
      optional :reason, :string, 3
    end
    add_message "classroom.sync_classroom.v1.DeleteClassroomAssignmentRecordsRequest" do
      optional :id, :int64, 1
    end
    add_message "classroom.sync_classroom.v1.DeleteClassroomAssignmentRecordsResponse" do
      optional :deleted, :bool, 1
    end
    add_message "classroom.sync_classroom.v1.CreateClassroomUserRequest" do
      optional :user_id, :int64, 1
    end
    add_message "classroom.sync_classroom.v1.CreateClassroomUserResponse" do
      optional :created, :bool, 1
      optional :reason, :string, 2
    end
    add_message "classroom.sync_classroom.v1.CreateClassroomInstructorRecordRequest" do
      optional :user_id, :int64, 1
      optional :classroom_id, :int64, 2
    end
    add_message "classroom.sync_classroom.v1.CreateClassroomInstructorRecordResponse" do
      optional :id, :int64, 1
      optional :created, :bool, 2
      optional :reason, :string, 3
    end
    add_message "classroom.sync_classroom.v1.DeleteClassroomInstructorRecordRequest" do
      optional :id, :int64, 1
      optional :classroom_id, :int64, 2
    end
    add_message "classroom.sync_classroom.v1.DeleteClassroomInstructorRecordResponse" do
      optional :deleted, :bool, 1
    end
  end
end

module MonolithTwirp
  module Classroom
    module SyncClassroom
      module V1
        CreateClassroomClassroomRecordsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.sync_classroom.v1.CreateClassroomClassroomRecordsRequest").msgclass
        CreateClassroomClassroomRecordsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.sync_classroom.v1.CreateClassroomClassroomRecordsResponse").msgclass
        DeleteClassroomClassroomRecordsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.sync_classroom.v1.DeleteClassroomClassroomRecordsRequest").msgclass
        DeleteClassroomClassroomRecordsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.sync_classroom.v1.DeleteClassroomClassroomRecordsResponse").msgclass
        CreateClassroomAssignmentRecordsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.sync_classroom.v1.CreateClassroomAssignmentRecordsRequest").msgclass
        CreateClassroomAssignmentRecordsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.sync_classroom.v1.CreateClassroomAssignmentRecordsResponse").msgclass
        DeleteClassroomAssignmentRecordsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.sync_classroom.v1.DeleteClassroomAssignmentRecordsRequest").msgclass
        DeleteClassroomAssignmentRecordsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.sync_classroom.v1.DeleteClassroomAssignmentRecordsResponse").msgclass
        CreateClassroomUserRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.sync_classroom.v1.CreateClassroomUserRequest").msgclass
        CreateClassroomUserResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.sync_classroom.v1.CreateClassroomUserResponse").msgclass
        CreateClassroomInstructorRecordRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.sync_classroom.v1.CreateClassroomInstructorRecordRequest").msgclass
        CreateClassroomInstructorRecordResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.sync_classroom.v1.CreateClassroomInstructorRecordResponse").msgclass
        DeleteClassroomInstructorRecordRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.sync_classroom.v1.DeleteClassroomInstructorRecordRequest").msgclass
        DeleteClassroomInstructorRecordResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("classroom.sync_classroom.v1.DeleteClassroomInstructorRecordResponse").msgclass
      end
    end
  end
end
