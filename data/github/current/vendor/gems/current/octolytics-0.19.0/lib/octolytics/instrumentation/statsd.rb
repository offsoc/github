require 'securerandom'
require 'active_support/notifications'
require 'octolytics/instrumentation/statsd_subscriber'

ActiveSupport::Notifications.subscribe /\.octolytics$/,
  Octolytics::Instrumentation::StatsdSubscriber
