require "datadog/statsd"
require "resolv"

module SpamuraiDevKit
  class Stats
    def self.get_stats_client(namespace, app, feature, env, tags: [])
      if env == "production"
        Datadog::Statsd.new(Resolv.getaddress(ENV["DOGSTATSD_HOST"] || "localhost"), 28125,
          namespace: "spamurai_dev_kit.#{namespace}",
          tags: [
            "spamurai_dev_kit_app:#{app}",
            "spamurai_dev_kit_feature:#{feature}",
            "spamurai_dev_kit_env:#{env}"
          ] + tags,
        )
      else
        NullDogstatsD.new
      end
    end

    class NullDogstatsD
      attr_accessor :host
      attr_accessor :port
      attr_accessor :tags
      attr_accessor :namespace
      attr_accessor :max_buffer_size

      def initialize(*)
        self.tags = []
      end
      def increment(stat, opts = {}); end
      def decrement(stat, opts = {}); end
      def count(stat, count, opts = {}); end
      def gauge(stat, value, opts = {}); end
      def histogram(stat, value, opts = {}); end
      def timing(stat, ms, opts = {}); end
      def time(stat, opts = {}); yield; end
      def set(stat, value, opts = {}); end
      def service_check(name, status, opts = {}); end
      def event(title, text, opts = {}); end
      def batch(); yield self; end
    end
  end
end
