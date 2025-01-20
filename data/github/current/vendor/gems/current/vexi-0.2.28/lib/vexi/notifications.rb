# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"
require "vexi/instrumenter"
require "vexi/instrumentation_context"
require "vexi/observability/notification"

# Public: The main Vexi module for performing feature flag enabled checks.
module Vexi
  # Public: The notifications class is used by components to publish notifications for observability
  class Notifications
    extend T::Sig

    class << self
      extend T::Sig
      sig { returns(Instrumenter) }
      attr_accessor :instrumenter

      sig { returns(T::Hash[Symbol, String]) }
      attr_accessor :configuration_context

      sig { void }
      def initialize
        @instrumenter = T.let(Observability::Notification.new, Instrumenter)
        @configuration_context = T.let({}, T::Hash[Symbol, String])
      end

      # Method instrument_exception publishes an event under the name vexi.#{operation}.error whenever an error has occurred
      sig do
        params(
          operation: String, message: String, err: Exception, context: Instrumenter::NotificationContext).void
      end
      def instrument_exception(operation, message, err, context)
        applied_context = T.let({
          operation: operation,
          message: message,
          exception: err
        }, Instrumenter::NotificationContext)
        applied_context = applied_context.merge(context, @configuration_context)

        @instrumenter.instrument("vexi.#{operation}.error", applied_context)
      end

      # Method instrument_duration publishes an event under the name vexi.#{operation}.duration whenever
      # a operation timing has been measured.
      sig do
        params(operation: String, measured_start: Time, measured_finish: Time, context: Instrumenter::NotificationContext).void
      end
      def instrument_duration(operation, measured_start, measured_finish, context)
        applied_context = T.let({
          operation: operation,
          measured_start: measured_start,
          measured_finish: measured_finish,
        }, Instrumenter::NotificationContext)
        applied_context = applied_context.merge(context, @configuration_context)

        @instrumenter.instrument("vexi.#{operation}.duration", applied_context)
      end

      # Method instrument_timing is a helper operation that wraps a block of code with timing
      # to call instrument_duration
      sig do
        type_parameters(:U)
        .params(
          operation: String,
          context: Instrumenter::NotificationContext,
          block: T.proc.params(context: InstrumentationContext).returns(T.type_parameter(:U))
        ).returns(T.type_parameter(:U))
      end
      def instrument_timing(operation, context = {}, &block)
        instrumentation_context = InstrumentationContext.new(context)
        start_time = Time.now
        block.call(instrumentation_context)
      ensure
        finish_time = Time.now
        Notifications.instrument_duration(operation, T.must(start_time), finish_time, instrumentation_context.to_h)
      end

      # Method instrument_cache_hit_or_miss publishes an event under the name `vexi.cache.#{cached_object_type}.get`
      # whenever a cache hit or miss occurs.
      sig do
        params(cached_object_type: String, cache_hit: T::Boolean, context: Instrumenter::NotificationContext).void
      end
      def instrument_cache_hit_or_miss(cached_object_type, cache_hit, context)
        applied_context = T.let({ cached_object_type: cached_object_type, cache_hit: cache_hit }, Instrumenter::NotificationContext)
        applied_context = applied_context.merge(context, @configuration_context)

        @instrumenter.instrument("vexi.cache.#{cached_object_type}.get", applied_context)
      end
    end

    # use ActiveSupport::Notifications as the default instrumentation service
    Notifications.instrumenter = T.let(Observability::Notification.new, Instrumenter)
    Notifications.configuration_context = T.let({}, T::Hash[Symbol, String])
  end
end
