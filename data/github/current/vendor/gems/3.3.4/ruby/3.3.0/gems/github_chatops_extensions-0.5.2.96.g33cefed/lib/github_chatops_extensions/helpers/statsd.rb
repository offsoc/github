# frozen_string_literal: true

# This module provides a datadog client enriched with default tags for the
# current command.

require "datadog/statsd"
require "resolv"

module GitHubChatopsExtensions
  class Helpers
    class Statsd
      DATADOG_HOST = ENV.fetch("KUBE_NODE_HOSTNAME", "localhost")
      DATADOG_PORT = ENV.fetch("DOGSTATSD_PORT", 28125)

      def initialize(command, subcommand, user, room_id)
        # Resolve the datadog host IP ahead of time to prevent doing a DNS
        # lookup on each call.
        @ip = Resolv.getaddress(DATADOG_HOST)

        @tags = [
          "command:#{command}",
          "subcommand:#{subcommand}",
          "user:#{user}",
          "room:#{room_id}",
         ]
      end

      def client
        @statsd ||= begin
          Datadog::Statsd.new(
            @ip,
            DATADOG_PORT,
            tags: @tags,
            single_thread: true, # ref: https://github.com/DataDog/dogstatsd-ruby#migrating-from-v4x-to-v5x
            buffer_max_pool_size: 1,
          )
        end
      end
    end
  end
end
