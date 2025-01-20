# frozen_string_literal: true

GitHub.subscribe "prose-diff.render" do |*args|
  event = ActiveSupport::Notifications::Event.new(*args)
  Rails.logger.debug { [:instrument, "prose-diff.render", event.duration] }

  if event.duration > 200 # ms
    exception = SlowProseDiff.new(event.payload[:diff], event.duration)
    exception.set_backtrace(caller)
    Failbot.report_user_error exception,
      repo: event.payload[:repository]
  end
end

class SlowProseDiff < StandardError
  def initialize(diff, time)
    super("[%d ms] %s %s..%s" % [time, diff.path, diff.a_sha, diff.b_sha])
  end
end
