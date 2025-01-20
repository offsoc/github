# frozen_string_literal: true

class DeloreanClient
  VERSION = "0.4.0"

  def initialize(base_url:)
    @base_url = base_url
  end

  def publish_event(timeline_id:, type:, operation:, title:, description:, occurred_at:, actions:, group_key:)
    connection.post("/api/v1/timelines/#{timeline_id}/events", {
      type: type,
      operation: operation,
      title: title,
      description: description,
      occurred_at: occurred_at.iso8601,
      group_key: group_key,
      actions: actions,
    })
  end

  private

  def connection
    @connection ||= Faraday.new(@base_url) do |conn|
      conn.request :json
      conn.adapter Faraday.default_adapter
      conn.options[:timeout] = 1
      conn.options[:open_timeout] = 0.5
    end
  end
end
