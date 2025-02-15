# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: spokes-api/streaming/v1/blob_filter.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("spokes-api/streaming/v1/blob_filter.proto", :syntax => :proto3) do
    add_message "github.spokes.batch.v1.BlobFilter" do
      optional :plain_text_only, :bool, 1
      optional :utf8_only, :bool, 2
      optional :max_line_length, :int64, 3
      optional :min_size, :int64, 4
      optional :max_size, :int64, 5
      optional :truncate_at, :uint32, 6
    end
  end
end

module GitHub
  module Spokes
    module Proto
      module Streaming
        module V1
          BlobFilter = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.batch.v1.BlobFilter").msgclass
        end
      end
    end
  end
end
