require 'resque'

module Resque
  module Failure
    class Failbot < Base
      def self.url
        "https://github.sentry.io/issues/"
      end

      def self.count(queue = nil, class_name = nil)
        # Fake it for now. Fake what exactly? I don't know.
        ::Resque::Stat[:failed].to_i
      end

      def save
        ::Failbot.report(exception,
          :worker => worker.to_s,
          :queue  => queue.to_s,
          :job    => payload['class'].to_s,
          :args   => payload['args'].inspect)
      end
    end
  end
end
