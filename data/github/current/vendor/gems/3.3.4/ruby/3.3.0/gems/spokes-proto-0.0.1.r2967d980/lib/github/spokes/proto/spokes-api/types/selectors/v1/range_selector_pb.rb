# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: spokes-api/types/selectors/v1/range_selector.proto

require 'google/protobuf'

require 'spokes-api/types/v1/treeish_pb'
require 'spokes-api/types/v1/path_pb'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("spokes-api/types/selectors/v1/range_selector.proto", :syntax => :proto3) do
    add_message "github.spokes.types.selectors.v1.RangeSelector" do
      optional :start, :message, 1, "github.spokes.types.v1.Treeish"
      optional :end, :message, 2, "github.spokes.types.v1.Treeish"
      repeated :paths, :message, 3, "github.spokes.types.v1.Path"
    end
  end
end

module GitHub
  module Spokes
    module Proto
      module Types
        module Selectors
          module V1
            RangeSelector = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.types.selectors.v1.RangeSelector").msgclass
          end
        end
      end
    end
  end
end
