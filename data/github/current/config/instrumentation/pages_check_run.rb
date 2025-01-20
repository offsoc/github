# frozen_string_literal: true

require "pages_check_re_run/service"

GitHub.subscribe("check_run.rerequest") do |*args|
  event = ActiveSupport::Notifications::Event.new(*args)
  PagesCheckReRun::Service.run(
    event.payload[:check_run_id],
    event.payload[:repository_id],
    event.payload[:actor_id],
  )
end
