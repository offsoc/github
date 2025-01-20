# frozen_string_literal: true

require "zuorest/utils"

module Zuorest::EventTriggers
  include Utils

  def get_event_triggers(headers: {})
    get("/events/event-triggers", headers: headers.merge(oauth_header))
  end

  def create_event_trigger(params:, headers: {})
    post("/events/event-triggers", body: params, headers: headers.merge(oauth_header))
  end

  def get_event_trigger(id, headers: {})
    Utils.validate_id(id)
    get("/events/event-triggers/#{id}", headers: headers.merge(oauth_header))
  end

  def update_event_trigger(id, params: {}, headers: {})
    Utils.validate_id(id)
    put("/events/event-triggers/#{id}", body: params, headers: headers.merge(oauth_header))
  end

  def destroy_event_trigger(id, headers: {})
    Utils.validate_id(id)
    delete("/events/event-triggers/#{id}", headers: headers.merge(oauth_header))
  end
end
