# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: users/v1/user_classroom_assignment_list_item.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("users/v1/user_classroom_assignment_list_item.proto", :syntax => :proto3) do
    add_message "education_web.users.v1.UserClassroomAssignmentListItem" do
      optional :classroom_name, :string, 1
      optional :assignment_name, :string, 2
      optional :assignment_type, :string, 3
      optional :deadline, :int64, 4
      optional :url, :string, 5
      optional :created_at, :int64, 6
      optional :check_suite_conclusion, :int64, 7
      optional :is_instructor, :bool, 8
      optional :assignment_id, :int64, 9
    end
  end
end

module MonolithTwirp
  module EducationWeb
    module Users
      module V1
        UserClassroomAssignmentListItem = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("education_web.users.v1.UserClassroomAssignmentListItem").msgclass
      end
    end
  end
end
