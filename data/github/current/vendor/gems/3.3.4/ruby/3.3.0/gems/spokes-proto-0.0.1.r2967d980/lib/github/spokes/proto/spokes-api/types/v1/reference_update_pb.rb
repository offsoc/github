# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: spokes-api/types/v1/reference_update.proto

require 'google/protobuf'

require 'spokes-api/types/v1/object_id_pb'
require 'spokes-api/types/v1/reference_pb'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("spokes-api/types/v1/reference_update.proto", :syntax => :proto3) do
    add_message "github.spokes.types.v1.ReferenceUpdate" do
      optional :reference, :message, 1, "github.spokes.types.v1.Reference"
      optional :before, :message, 2, "github.spokes.types.v1.ObjectID"
      optional :after, :message, 3, "github.spokes.types.v1.ObjectID"
    end
  end
end

module GitHub
  module Spokes
    module Proto
      module Types
        module V1
          ReferenceUpdate = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.types.v1.ReferenceUpdate").msgclass
        end
      end
    end
  end
end
