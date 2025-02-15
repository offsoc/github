# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: streaming/v1/conf_api.proto

require 'google/protobuf'

require 'google/protobuf/timestamp_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("streaming/v1/conf_api.proto", :syntax => :proto3) do
    add_message "auditlog.streaming.v1.ConfigurationWithLimitRequest" do
      optional :limit, :int32, 1
      optional :offset, :int32, 2
    end
    add_message "auditlog.streaming.v1.ConfigurationWithLimitResponse" do
      repeated :splunks, :message, 1, "auditlog.streaming.v1.SplunkSink"
      repeated :azure_hubs, :message, 2, "auditlog.streaming.v1.AzureHubsSink"
      repeated :s3_buckets, :message, 3, "auditlog.streaming.v1.S3Sink"
      repeated :gcp_buckets, :message, 4, "auditlog.streaming.v1.GcpStorageSink"
      repeated :azure_blobs, :message, 5, "auditlog.streaming.v1.AzureBlobStorageSink"
      repeated :datadogs, :message, 6, "auditlog.streaming.v1.DatadogSink"
      optional :count, :int32, 7
      optional :offset, :int32, 8
    end
    add_message "auditlog.streaming.v1.ConfigurationRequest" do
    end
    add_message "auditlog.streaming.v1.ConfigurationResponse" do
      repeated :splunks, :message, 1, "auditlog.streaming.v1.SplunkSink"
      repeated :azure_hubs, :message, 2, "auditlog.streaming.v1.AzureHubsSink"
      repeated :s3_buckets, :message, 3, "auditlog.streaming.v1.S3Sink"
      repeated :gcp_buckets, :message, 4, "auditlog.streaming.v1.GcpStorageSink"
      repeated :azure_blobs, :message, 5, "auditlog.streaming.v1.AzureBlobStorageSink"
      repeated :datadogs, :message, 6, "auditlog.streaming.v1.DatadogSink"
    end
    add_message "auditlog.streaming.v1.SplunkSink" do
      optional :subject_id, :int64, 1
      optional :subject_name, :string, 2
      optional :subject_type, :enum, 3, "auditlog.streaming.v1.SplunkSink.SubjectType"
      optional :domain, :string, 4
      optional :port, :int32, 5
      optional :key_id, :string, 6
      optional :encrypted_token, :string, 7
      optional :is_disabled, :bool, 8
      optional :ssl_verify, :bool, 9
      repeated :feature_flags, :string, 10
      optional :paused_at, :message, 11, "google.protobuf.Timestamp"
      optional :is_gh_staff_disabled, :bool, 12
      optional :are_api_events_enabled, :bool, 13
      optional :idx, :int32, 14
    end
    add_enum "auditlog.streaming.v1.SplunkSink.SubjectType" do
      value :SUBJECT_TYPE_INVALID, 0
      value :SUBJECT_TYPE_ORGANIZATION, 1
      value :SUBJECT_TYPE_BUSINESSS, 2
    end
    add_message "auditlog.streaming.v1.AzureHubsSink" do
      optional :subject_id, :int64, 1
      optional :subject_name, :string, 2
      optional :subject_type, :enum, 3, "auditlog.streaming.v1.AzureHubsSink.SubjectType"
      optional :name, :string, 4
      optional :key_id, :string, 5
      optional :encrypted_connstring, :string, 6
      optional :is_disabled, :bool, 7
      repeated :feature_flags, :string, 8
      optional :paused_at, :message, 9, "google.protobuf.Timestamp"
      optional :is_gh_staff_disabled, :bool, 10
      optional :are_api_events_enabled, :bool, 11
      optional :idx, :int32, 12
    end
    add_enum "auditlog.streaming.v1.AzureHubsSink.SubjectType" do
      value :SUBJECT_TYPE_INVALID, 0
      value :SUBJECT_TYPE_ORGANIZATION, 1
      value :SUBJECT_TYPE_BUSINESSS, 2
    end
    add_message "auditlog.streaming.v1.AzureBlobStorageSink" do
      optional :subject_id, :int64, 1
      optional :subject_name, :string, 2
      optional :subject_type, :enum, 3, "auditlog.streaming.v1.AzureBlobStorageSink.SubjectType"
      optional :key_id, :string, 4
      optional :encrypted_sas_url, :string, 5
      optional :is_disabled, :bool, 6
      repeated :feature_flags, :string, 7
      optional :paused_at, :message, 8, "google.protobuf.Timestamp"
      optional :is_gh_staff_disabled, :bool, 9
      optional :are_api_events_enabled, :bool, 10
      optional :idx, :int32, 11
    end
    add_enum "auditlog.streaming.v1.AzureBlobStorageSink.SubjectType" do
      value :SUBJECT_TYPE_INVALID, 0
      value :SUBJECT_TYPE_ORGANIZATION, 1
      value :SUBJECT_TYPE_BUSINESSS, 2
    end
    add_message "auditlog.streaming.v1.S3Sink" do
      optional :subject_id, :int64, 1
      optional :subject_name, :string, 2
      optional :subject_type, :enum, 3, "auditlog.streaming.v1.S3Sink.SubjectType"
      optional :bucket, :string, 4
      optional :key_id, :string, 5
      optional :encrypted_access_key_id, :string, 6
      optional :encrypted_secret_key, :string, 7
      optional :is_disabled, :bool, 8
      repeated :feature_flags, :string, 9
      optional :authentication_type, :enum, 10, "auditlog.streaming.v1.S3Sink.AuthenticationType"
      optional :arn_role, :string, 11
      optional :region, :string, 12
      optional :paused_at, :message, 13, "google.protobuf.Timestamp"
      optional :is_gh_staff_disabled, :bool, 14
      optional :are_api_events_enabled, :bool, 15
      optional :idx, :int32, 16
    end
    add_enum "auditlog.streaming.v1.S3Sink.SubjectType" do
      value :SUBJECT_TYPE_INVALID, 0
      value :SUBJECT_TYPE_ORGANIZATION, 1
      value :SUBJECT_TYPE_BUSINESSS, 2
    end
    add_enum "auditlog.streaming.v1.S3Sink.AuthenticationType" do
      value :AUTHENTICATION_TYPE_INVALID, 0
      value :AUTHENTICATION_TYPE_ACCESS_KEYS, 1
      value :AUTHENTICATION_TYPE_OIDC_AUDIT_LOG, 2
      value :AUTHENTICATION_TYPE_OIDC_GITHUB, 3
    end
    add_message "auditlog.streaming.v1.GcpStorageSink" do
      optional :subject_id, :int64, 1
      optional :subject_name, :string, 2
      optional :subject_type, :enum, 3, "auditlog.streaming.v1.GcpStorageSink.SubjectType"
      optional :bucket, :string, 4
      optional :key_id, :string, 5
      optional :encrypted_json_credentials, :string, 6
      optional :is_disabled, :bool, 7
      repeated :feature_flags, :string, 8
      optional :paused_at, :message, 9, "google.protobuf.Timestamp"
      optional :is_gh_staff_disabled, :bool, 10
      optional :are_api_events_enabled, :bool, 11
      optional :idx, :int32, 12
    end
    add_enum "auditlog.streaming.v1.GcpStorageSink.SubjectType" do
      value :SUBJECT_TYPE_INVALID, 0
      value :SUBJECT_TYPE_ORGANIZATION, 1
      value :SUBJECT_TYPE_BUSINESSS, 2
    end
    add_message "auditlog.streaming.v1.SyslogSink" do
      optional :subject_id, :int64, 1
      optional :protocol_type, :enum, 2, "auditlog.streaming.v1.SyslogSink.ProtocolType"
      optional :server_address, :string, 3
      optional :peer_tls_cert, :string, 4
      optional :is_disabled, :bool, 5
      repeated :feature_flags, :string, 6
      optional :paused_at, :message, 7, "google.protobuf.Timestamp"
      optional :is_gh_staff_disabled, :bool, 8
      optional :are_api_events_enabled, :bool, 9
      optional :idx, :int32, 10
    end
    add_enum "auditlog.streaming.v1.SyslogSink.SubjectType" do
      value :SUBJECT_TYPE_INVALID, 0
      value :SUBJECT_TYPE_ORGANIZATION, 1
      value :SUBJECT_TYPE_BUSINESS, 2
    end
    add_enum "auditlog.streaming.v1.SyslogSink.ProtocolType" do
      value :PROTOCOL_TYPE_INVALID, 0
      value :PROTOCOL_TYPE_UDP, 1
      value :PROTOCOL_TYPE_UDP6, 2
      value :PROTOCOL_TYPE_TCP, 3
      value :PROTOCOL_TYPE_TCP6, 4
      value :PROTOCOL_TYPE_TCP_TLS, 5
      value :PROTOCOL_TYPE_TCP6_TLS, 6
    end
    add_message "auditlog.streaming.v1.DatadogSink" do
      optional :subject_id, :int64, 1
      optional :subject_name, :string, 2
      optional :subject_type, :enum, 3, "auditlog.streaming.v1.DatadogSink.SubjectType"
      optional :site, :string, 4
      optional :key_id, :string, 5
      optional :encrypted_token, :string, 6
      optional :is_disabled, :bool, 7
      optional :ssl_verify, :bool, 8
      repeated :feature_flags, :string, 9
      optional :paused_at, :message, 10, "google.protobuf.Timestamp"
      optional :is_gh_staff_disabled, :bool, 11
      optional :are_api_events_enabled, :bool, 12
      optional :idx, :int32, 13
    end
    add_enum "auditlog.streaming.v1.DatadogSink.SubjectType" do
      value :SUBJECT_TYPE_INVALID, 0
      value :SUBJECT_TYPE_ORGANIZATION, 1
      value :SUBJECT_TYPE_BUSINESS, 2
    end
  end
end

module MonolithTwirp
  module Auditlog
    module Streaming
      module V1
        ConfigurationWithLimitRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.ConfigurationWithLimitRequest").msgclass
        ConfigurationWithLimitResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.ConfigurationWithLimitResponse").msgclass
        ConfigurationRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.ConfigurationRequest").msgclass
        ConfigurationResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.ConfigurationResponse").msgclass
        SplunkSink = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.SplunkSink").msgclass
        SplunkSink::SubjectType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.SplunkSink.SubjectType").enummodule
        AzureHubsSink = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.AzureHubsSink").msgclass
        AzureHubsSink::SubjectType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.AzureHubsSink.SubjectType").enummodule
        AzureBlobStorageSink = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.AzureBlobStorageSink").msgclass
        AzureBlobStorageSink::SubjectType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.AzureBlobStorageSink.SubjectType").enummodule
        S3Sink = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.S3Sink").msgclass
        S3Sink::SubjectType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.S3Sink.SubjectType").enummodule
        S3Sink::AuthenticationType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.S3Sink.AuthenticationType").enummodule
        GcpStorageSink = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.GcpStorageSink").msgclass
        GcpStorageSink::SubjectType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.GcpStorageSink.SubjectType").enummodule
        SyslogSink = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.SyslogSink").msgclass
        SyslogSink::SubjectType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.SyslogSink.SubjectType").enummodule
        SyslogSink::ProtocolType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.SyslogSink.ProtocolType").enummodule
        DatadogSink = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.DatadogSink").msgclass
        DatadogSink::SubjectType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("auditlog.streaming.v1.DatadogSink.SubjectType").enummodule
      end
    end
  end
end
