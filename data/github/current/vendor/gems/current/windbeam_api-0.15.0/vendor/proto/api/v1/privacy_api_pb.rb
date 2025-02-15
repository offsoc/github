# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: proto/api/v1/privacy_api.proto

require 'google/protobuf'

require 'google/protobuf/empty_pb'
require 'google/protobuf/timestamp_pb'
require 'proto/api/v1/shared_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("proto/api/v1/privacy_api.proto", :syntax => :proto3) do
    add_message "windbeam.api.v1.PingResp" do
      optional :now, :message, 1, "google.protobuf.Timestamp"
      optional :status, :string, 2
    end
    add_message "windbeam.api.v1.GetAllParticipantsResp" do
      repeated :clients, :message, 1, "windbeam.api.v1.Participant"
    end
    add_message "windbeam.api.v1.DeleteUserReq" do
      optional :account_id, :uint64, 1
      optional :account_type, :enum, 2, "windbeam.api.v1.AccountType"
      optional :identity_id, :string, 3
      optional :identity_type, :enum, 4, "windbeam.api.v1.IdentityType"
      optional :login, :string, 5
      repeated :participants, :string, 6
      optional :email, :string, 7
      optional :analytics_tracking_id, :string, 8
      optional :shortcode, :string, 9
      optional :slug, :string, 10
    end
    add_message "windbeam.api.v1.DeleteUserResp" do
      optional :request_id, :string, 1
      optional :created_at, :message, 2, "google.protobuf.Timestamp"
    end
    add_message "windbeam.api.v1.ExportUserReq" do
      optional :account_id, :uint64, 1
      optional :account_type, :enum, 2, "windbeam.api.v1.AccountType"
      optional :identity_id, :string, 3
      optional :identity_type, :enum, 4, "windbeam.api.v1.IdentityType"
      optional :login, :string, 5
      repeated :participants, :string, 6
      optional :email, :string, 7
      optional :analytics_tracking_id, :string, 8
      optional :shortcode, :string, 9
      optional :slug, :string, 10
    end
    add_message "windbeam.api.v1.ExportUserResp" do
      optional :request_id, :string, 1
      optional :created_at, :message, 2, "google.protobuf.Timestamp"
    end
    add_message "windbeam.api.v1.RequestStatusReq" do
      optional :request_id, :string, 1
    end
    add_message "windbeam.api.v1.RequestStatusResp" do
      optional :request_id, :string, 1
      optional :created_at, :message, 2, "google.protobuf.Timestamp"
      optional :status, :string, 3
      optional :start_date, :message, 4, "google.protobuf.Timestamp"
    end
    add_message "windbeam.api.v1.Export" do
      optional :request_id, :string, 1
      optional :participant_name, :string, 2
      optional :status, :string, 3
      optional :created_at, :message, 4, "google.protobuf.Timestamp"
    end
    add_message "windbeam.api.v1.ListExportsReq" do
      optional :request_id, :string, 1
    end
    add_message "windbeam.api.v1.ListExportsResp" do
      repeated :exports, :message, 1, "windbeam.api.v1.Export"
    end
    add_message "windbeam.api.v1.GetDownloadUrlReq" do
      optional :request_id, :string, 1
      optional :participant_name, :string, 2
    end
    add_message "windbeam.api.v1.GetDownloadUrlResp" do
      optional :sas_url, :string, 1
    end
    add_message "windbeam.api.v1.GetUserRequestsReq" do
      optional :user, :string, 1
      optional :start_date, :message, 2, "google.protobuf.Timestamp"
      optional :status, :enum, 3, "windbeam.api.v1.Status"
    end
    add_message "windbeam.api.v1.GetUserRequestsResp" do
      repeated :requests, :message, 1, "windbeam.api.v1.Request"
    end
  end
end

module Windbeam
  module Api
    module V1
      PingResp = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.PingResp").msgclass
      GetAllParticipantsResp = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.GetAllParticipantsResp").msgclass
      DeleteUserReq = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.DeleteUserReq").msgclass
      DeleteUserResp = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.DeleteUserResp").msgclass
      ExportUserReq = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.ExportUserReq").msgclass
      ExportUserResp = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.ExportUserResp").msgclass
      RequestStatusReq = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.RequestStatusReq").msgclass
      RequestStatusResp = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.RequestStatusResp").msgclass
      Export = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.Export").msgclass
      ListExportsReq = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.ListExportsReq").msgclass
      ListExportsResp = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.ListExportsResp").msgclass
      GetDownloadUrlReq = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.GetDownloadUrlReq").msgclass
      GetDownloadUrlResp = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.GetDownloadUrlResp").msgclass
      GetUserRequestsReq = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.GetUserRequestsReq").msgclass
      GetUserRequestsResp = Google::Protobuf::DescriptorPool.generated_pool.lookup("windbeam.api.v1.GetUserRequestsResp").msgclass
    end
  end
end
