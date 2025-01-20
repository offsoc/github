# typed: true
# frozen_string_literal: true

module SpokesClientInstrumentation
  ActiveSupport::Notifications.subscribe "rpc.client.spokes" do |*args|
    call_event = ActiveSupport::Notifications::Event.new *args

    client = call_event.payload[:client].client_name
    tags = [
      "rpc:#{call_event.payload[:method]}",
      "client:#{client}",
    ]

    if call_event.payload[:exception].nil?
      tags << "err:none"
    else
      exc_name, _ = call_event.payload[:exception]
      tags << "err:#{exc_name.underscore}"
    end

    GitHub.dogstats.timing(
      "rpc.spokes.time".freeze,
      call_event.duration,
      tags: tags)
  end

  ActiveSupport::Notifications.subscribe "fallback.client.spokes" do |*args|
    call_event = ActiveSupport::Notifications::Event.new *args

    GitHub.logger.error({ :exception => call_event.payload[:exception], "code.function" => call_event.payload[:method] })

    tags = [
          "rpc:#{call_event.payload[:method]}",
          "err:#{call_event.payload[:exception].class.name.underscore}",
    ]

    GitHub.dogstats.increment("rpc.spokes.fallback", tags: tags)
  end
end
