# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: spokes-api/types/v1/path.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("spokes-api/types/v1/path.proto", :syntax => :proto3) do
    add_message "github.spokes.types.v1.Path" do
      optional :name, :bytes, 1
    end
  end
end

module GitHub
  module Spokes
    module Proto
      module Types
        module V1
          Path = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.types.v1.Path").msgclass
        end
      end
    end
  end
end
