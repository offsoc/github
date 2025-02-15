# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: event_hydration/v1/vendored_tier2_event.proto

require 'google/protobuf'

require_relative '../../event_hydration/v1/vendored_delivery_pb'
require_relative '../../event_hydration/v1/vendored_tier1_event_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("event_hydration/v1/vendored_tier2_event.proto", :syntax => :proto3) do
    add_message "hydro.schemas.events_platform.v0.Tier2Event" do
      optional :tier1_event, :message, 1, "hydro.schemas.events_platform.v0.Tier1Event"
      optional :delivery, :message, 2, "hydro.schemas.events_platform.v0.entities.Delivery"
      optional :has_target_repository_disabled_webhooks, :bool, 3
      optional :hydration_status, :enum, 4, "hydro.schemas.events_platform.v0.Tier2Event.HydrationStatus"
    end
    add_enum "hydro.schemas.events_platform.v0.Tier2Event.HydrationStatus" do
      value :HYDRATION_STATUS_UNKNOWN, 0
      value :HYDRATION_STATUS_SUCCESS, 1
      value :HYDRATION_STATUS_RESOURCE_NOT_FOUND, 2
    end
  end
end

module Hydro
  module Schemas
    module EventsPlatform
      module V0
        Tier2Event = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("hydro.schemas.events_platform.v0.Tier2Event").msgclass
        Tier2Event::HydrationStatus = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("hydro.schemas.events_platform.v0.Tier2Event.HydrationStatus").enummodule
      end
    end
  end
end
