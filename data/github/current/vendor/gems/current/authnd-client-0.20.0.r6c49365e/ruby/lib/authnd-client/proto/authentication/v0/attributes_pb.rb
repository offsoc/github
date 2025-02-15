# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: authentication/v0/attributes.proto

require 'google/protobuf'

require 'google/protobuf/struct_pb'
require 'google/protobuf/timestamp_pb'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("authentication/v0/attributes.proto", :syntax => :proto3) do
    add_message "github.authentication.v0.Attribute" do
      optional :id, :string, 1
      optional :value, :message, 2, "github.authentication.v0.Value"
    end
    add_message "github.authentication.v0.AttributeList" do
      repeated :attributes, :message, 1, "github.authentication.v0.Attribute"
    end
    add_message "github.authentication.v0.Value" do
      oneof :kind do
        optional :null_value, :enum, 1, "google.protobuf.NullValue"
        optional :integer_value, :int64, 2
        optional :double_value, :double, 3
        optional :string_value, :string, 4
        optional :bool_value, :bool, 5
        optional :integer_list_value, :message, 6, "github.authentication.v0.IntegerList"
        optional :string_list_value, :message, 7, "github.authentication.v0.StringList"
        optional :time_value, :message, 8, "google.protobuf.Timestamp"
      end
    end
    add_message "github.authentication.v0.IntegerList" do
      repeated :values, :int64, 1
    end
    add_message "github.authentication.v0.StringList" do
      repeated :values, :string, 1
    end
  end
end

module Authnd
  module Proto
    Attribute = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.authentication.v0.Attribute").msgclass
    AttributeList = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.authentication.v0.AttributeList").msgclass
    Value = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.authentication.v0.Value").msgclass
    IntegerList = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.authentication.v0.IntegerList").msgclass
    StringList = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.authentication.v0.StringList").msgclass
  end
end
