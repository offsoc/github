# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: spokes-api/types/v1/diff_algorithm.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("spokes-api/types/v1/diff_algorithm.proto", :syntax => :proto3) do
    add_enum "github.spokes.types.v1.DiffAlgorithm" do
      value :DIFF_ALGORITHM_INVALID, 0
      value :DIFF_ALGORITHM_DEFAULT, 1
    end
  end
end

module GitHub
  module Spokes
    module Proto
      module Types
        module V1
          DiffAlgorithm = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.types.v1.DiffAlgorithm").enummodule
        end
      end
    end
  end
end
