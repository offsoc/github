# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: event_hydration/v1/vendored_event_attachment.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("event_hydration/v1/vendored_event_attachment.proto", :syntax => :proto3) do
    add_message "hydro.schemas.events_platform.v0.entities.EventAttachment" do
      optional :type_url, :string, 1
      optional :message, :bytes, 2
    end
  end
end

module Hydro
  module Schemas
    module EventsPlatform
      module V0
        module Entities
          EventAttachment = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("hydro.schemas.events_platform.v0.entities.EventAttachment").msgclass
        end
      end
    end
  end
end
