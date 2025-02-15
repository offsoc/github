# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: event_hydration/v1/vendored_hydration_request.proto

require 'google/protobuf'

require_relative '../../event_hydration/v1/vendored_delivery_pb'
require_relative '../../event_hydration/v1/vendored_tier1_event_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("event_hydration/v1/vendored_hydration_request.proto", :syntax => :proto3) do
    add_message "hydro.schemas.events_platform.v0.HydrationRequest" do
      optional :tier1_event, :message, 1, "hydro.schemas.events_platform.v0.Tier1Event"
      repeated :deliveries, :message, 2, "hydro.schemas.events_platform.v0.entities.Delivery"
    end
  end
end

module Hydro
  module Schemas
    module EventsPlatform
      module V0
        HydrationRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("hydro.schemas.events_platform.v0.HydrationRequest").msgclass
      end
    end
  end
end
