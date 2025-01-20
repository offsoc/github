require 'resque'

module Resque
  module Failure
    class Failbot < Base
      def self.url
        if ENV['RAILS_ENV'] == 'staging'
          "http://haystack-staging.githubapp.com/types/exception"
        else
          "http://haystack.githubapp.com/types/exception"
        end
      end

      def self.count
        # Fake it for now.
        Stat[:failed]
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
