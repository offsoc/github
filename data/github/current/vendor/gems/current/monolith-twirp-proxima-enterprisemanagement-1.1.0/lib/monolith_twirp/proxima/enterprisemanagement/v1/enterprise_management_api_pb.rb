# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: enterprisemanagement/v1/enterprise_management_api.proto

require 'google/protobuf'

require 'google/protobuf/timestamp_pb'
require 'google/protobuf/wrappers_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("enterprisemanagement/v1/enterprise_management_api.proto", :syntax => :proto3) do
    add_message "proxima.enterprisemanagement.v1.ValidateEnterpriseRequest" do
      optional :name, :string, 1
      optional :slug, :string, 2
      optional :emu_short_code, :string, 3
      optional :seats, :int32, 4
      optional :billing_end_date, :message, 5, "google.protobuf.Timestamp"
      optional :first_admin_user_email, :string, 6
      optional :trace_id, :string, 7
      optional :span_id, :string, 8
      optional :trace_timestamp, :message, 9, "google.protobuf.Timestamp"
      optional :can_self_serve, :message, 10, "google.protobuf.BoolValue"
      optional :is_staff_owned, :bool, 11
      optional :is_part_of_startup_program, :bool, 12
      optional :trial_expires_at, :message, 13, "google.protobuf.Timestamp"
      optional :is_advanced_security_purchased_for_entity, :bool, 14
      optional :advanced_security_seats_for_entity, :int32, 15
      optional :terms_of_service_company_name, :string, 16
      optional :terms_of_service_type, :enum, 17, "proxima.enterprisemanagement.v1.TOSType"
      optional :terms_of_service_notes, :string, 18
      optional :billing_email, :string, 19
      optional :enterprise_web_business_id, :string, 20
      optional :support_plan, :enum, 21, "proxima.enterprisemanagement.v1.SupportPlan"
    end
    add_message "proxima.enterprisemanagement.v1.CreateEnterpriseRequest" do
      optional :name, :string, 1
      optional :slug, :string, 2
      optional :emu_short_code, :string, 3
      optional :seats, :int32, 4
      optional :billing_end_date, :message, 5, "google.protobuf.Timestamp"
      optional :first_admin_user_email, :string, 6
      optional :trace_id, :string, 7
      optional :span_id, :string, 8
      optional :trace_timestamp, :message, 9, "google.protobuf.Timestamp"
      optional :can_self_serve, :message, 10, "google.protobuf.BoolValue"
      optional :is_staff_owned, :bool, 11
      optional :is_part_of_startup_program, :bool, 12
      optional :trial_expires_at, :message, 13, "google.protobuf.Timestamp"
      optional :is_advanced_security_purchased_for_entity, :bool, 14
      optional :advanced_security_seats_for_entity, :int32, 15
      optional :terms_of_service_company_name, :string, 16
      optional :terms_of_service_type, :enum, 17, "proxima.enterprisemanagement.v1.TOSType"
      optional :terms_of_service_notes, :string, 18
      optional :billing_email, :string, 19
      optional :enterprise_web_business_id, :string, 20
      optional :support_plan, :enum, 21, "proxima.enterprisemanagement.v1.SupportPlan"
    end
    add_message "proxima.enterprisemanagement.v1.ValidateEnterpriseResponse" do
      optional :is_successful, :bool, 1
      repeated :error_messages, :string, 2
    end
    add_message "proxima.enterprisemanagement.v1.CreateEnterpriseResponse" do
      optional :enterprise_id, :int32, 1
    end
    add_enum "proxima.enterprisemanagement.v1.TOSType" do
      value :TOS_TYPE_INVALID, 0
      value :TOS_TYPE_CORPORATE, 1
      value :TOS_TYPE_CUSTOM, 2
      value :TOS_TYPE_CORPORATE_AND_EDUCATION, 3
    end
    add_enum "proxima.enterprisemanagement.v1.SupportPlan" do
      value :SUPPORT_PLAN_INVALID, 0
      value :SUPPORT_PLAN_STANDARD, 1
      value :SUPPORT_PLAN_PREMIUM, 2
      value :SUPPORT_PLAN_PREMIUM_PLUS, 3
      value :SUPPORT_PLAN_PREMIUM_PLUS_ENGINEERING_DIRECT, 4
      value :SUPPORT_PLAN_PREMIUM_PLUS_ENGINEERING_DIRECT_PREMIER, 5
      value :SUPPORT_PLAN_PREMIUM_PLUS_ENGINEERING_DIRECT_UNIFIED_A, 6
      value :SUPPORT_PLAN_PREMIUM_PLUS_ENGINEERING_DIRECT_UNIFIED_P, 7
      value :SUPPORT_PLAN_PREMIUM_UNIFIED_ADVANCED, 8
      value :SUPPORT_PLAN_PREMIUM_UNIFIED_PERFORMANCE, 9
      value :SUPPORT_PLAN_PREMIUM_PREMIER, 10
      value :SUPPORT_PLAN_EDUCATION, 11
    end
  end
end

module MonolithTwirp
  module Proxima
    module EnterpriseManagement
      module V1
        ValidateEnterpriseRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("proxima.enterprisemanagement.v1.ValidateEnterpriseRequest").msgclass
        CreateEnterpriseRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("proxima.enterprisemanagement.v1.CreateEnterpriseRequest").msgclass
        ValidateEnterpriseResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("proxima.enterprisemanagement.v1.ValidateEnterpriseResponse").msgclass
        CreateEnterpriseResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("proxima.enterprisemanagement.v1.CreateEnterpriseResponse").msgclass
        TOSType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("proxima.enterprisemanagement.v1.TOSType").enummodule
        SupportPlan = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("proxima.enterprisemanagement.v1.SupportPlan").enummodule
      end
    end
  end
end
