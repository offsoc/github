# frozen_string_literal: true

require "active_support/log_subscriber"

module GitHub
  module Telemetry
    module Logs
      module ActiveJob
        # Subscriber for `ActiveSupport::Subscriber` for `ActiveJob` events.
        #
        # Unlike the default `ActiveJob::LogSubscriber``, this uses named loggers that are specific to instrumented job class.
        # Doing so allows for more granular control over logging levels and destinations for each job class,
        # as opposed to impacting all jobs.
        #
        # All log messages will include GitHub semantic convention attributes:
        # - `messaging.message_id` - the `ActiveJob#job_id
        # - `exception.*` - the exception object if one was raised
        #
        # The following events are instrumented:
        # - `discard.active_job` - when a job is discarded
        # - `perform.active_job` - when a job is performed
        # - `enqueue.active_job` - when a job is enqueued
        # - `enqueue_at.active_job` - when a job is enqueued at a specific time
        class Subscriber < ActiveSupport::Subscriber
          include ::GitHub::Telemetry::Logs::Loggable

          # Logs `discard.active_job` events
          # This event is logged at `error` level including the `exception` that was raised.
          #
          # @param event [ActiveSupport::Notifications::Event]
          # @return [void]
          def discard(event)
            job = event.payload.fetch(:job)
            ex = event.payload.fetch(:error)
            job.logger.tagged("messaging.message_id" => job.job_id) do
              job.logger.error event.name, ex
            end
          end

          # Logs `perform.active_job` events
          # This event is logged at `info` level unless an `exception` was raised then it is logged at `error` level.
          #
          # @param event [ActiveSupport::Notifications::Event]
          # @return [void]
          def perform(event)
            job = event.payload.fetch(:job)
            job.logger.tagged("messaging.message_id" => job.job_id) do
              ex = event.payload[:exception_object]
              if ex
                job.logger.error event.name, ex
              else
                job.logger.info event.name
              end
            end
          rescue StandardError => e
            logger.fatal event.name, e
          end

          # Logs `enqueue.active_job` events
          # This event is logged at `info` level unless an `exception` was raised
          # or it is unable to enqueue the job, then it is logged at `error` level.
          #
          # @param event [ActiveSupport::Notifications::Event]
          # @return [void]
          def enqueue(event)
            job = event.payload.fetch(:job)
            job.logger.tagged("messaging.message_id" => job.job_id) do
              ex = event.payload[:exception_object]
              if ex
                job.logger.error event.name, ex
              elsif event.payload[:aborted]
                job.logger.error event.name, { "exception.message": "before_enqueue callback halted the enqueuing execution." }
              else
                job.logger.info event.name
              end
            end
          end
          alias_method :enqueue_at, :enqueue

          # Registers this subscriber to `ActiveSupport::Subscriber` for `ActiveJob` events.
          #
          # @param config [GitHub::Telemetry::Config::Base]
          def self.install(config)
            if defined?(::ActiveJob) && config.enabled?
              if defined?(::ActiveJob::LogSubscriber)
                ::ActiveJob::LogSubscriber.detach_from(:active_job)
              end

              if defined?(::RailsSemanticLogger::ActiveJob::LogSubscriber)
                ::RailsSemanticLogger::ActiveJob::LogSubscriber.detach_from(:active_job)
              end
              attach_to(:active_job)
            end
          end
        end
      end
    end
  end
end
