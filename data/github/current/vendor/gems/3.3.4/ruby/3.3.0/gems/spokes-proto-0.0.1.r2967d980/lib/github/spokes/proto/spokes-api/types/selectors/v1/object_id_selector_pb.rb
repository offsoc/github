# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: spokes-api/types/selectors/v1/object_id_selector.proto

require 'google/protobuf'

require 'spokes-api/types/v1/object_id_pb'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("spokes-api/types/selectors/v1/object_id_selector.proto", :syntax => :proto3) do
    add_message "github.spokes.types.selectors.v1.ObjectIDSelector" do
      repeated :oids, :message, 1, "github.spokes.types.v1.ObjectID"
    end
  end
end

module GitHub
  module Spokes
    module Proto
      module Types
        module Selectors
          module V1
            ObjectIDSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.types.selectors.v1.ObjectIDSelector").msgclass
          end
        end
      end
    end
  end
end
