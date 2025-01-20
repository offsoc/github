require "logger"

module Aqueduct
  module Worker
      class Switch
        def initialize(check:, interval:, logger: , reporter: ->(e) {}, now: -> { Time.now })
          @check    = check
          @interval = interval
          @logger   = logger
          @reporter = reporter
          @now      = now
        end

        def on?
          if stale?
            @on = fire_check
            @last_completed_at = @now.call
          end

          @on
        end

        private

        def stale?
          @last_completed_at.nil? || (@last_completed_at + @interval < @now.call)
        end

        def fire_check
          !!@check.call
        rescue Exception => e
          @reporter.call(e)
          @logger.error("Queisce check threw exception: #{e.class}: #{e.message}")
          false
        end
      end
  end
end
