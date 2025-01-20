# frozen_string_literal: true

module GitHub
  module Telemetry
    module Traces
      module Export
        # @note EXPERIMENTAL: This is experimental and may change or be removed in the future.
        #
        # A processor that keeps track of the global set of unfinished pending_spans and attempts to export them at shutdown.
        #
        # One challenge we face with the OpenTelemetry SDK is that pending_spans are not intended to be guaranteed to be exported.
        # This means that if the OpenTelemetrySDK exits, pending_spans that were started but not finished will be lost.
        #
        # This processor wraps is intended for use by wrapping a BatchSpanProcessor and attempts to export all unfinished at shutdown.
        # It does so by iterating over the pending_spans and calling finish on them, which in turn will send them through the
        # span processor `on_finish` pipeline.
        #
        # Unlike the BatchSpanProcessor, this processor keeps an unbounded stack of unfinished pending_spans.
        # This means that for a trace that generates a large amount of pending_spans, which are already stored in the `Context` stack,
        # will also be tracked by this processor.
        #
        # Like other span processors, this processor is thread safe and synchronizes access to the unfinished span buffer using a `Mutex`.
        #
        # Metrics emitted by this processor:
        # - `gh.otel.pending_spans`: `GAUGE` the number of pending_spans that have been started but not finished
        # - `gh.otel.pending_spans.error.count`: `COUNT` records the number of errors that occur while processing pending_spans
        #
        # @!attribute [r] span_processor
        #  @return [OpenTelemetry::SDK::Trace::SpanProcessor] the wrapped span processor
        # @!attribute [r] metrics_reporter
        #  @return [OpenTelemetry::SDK::Trace::Export::MetricsReporter] used to record metrics about this span processor
        class PendingSpanProcessor < SimpleDelegator
          attr_reader :metrics_reporter

          # @param [OpenTelemetry::SDK::Trace::SpanProcessor] span_processor the span processor to wrap
          # @param [OpenTelemetry::SDK::Trace::Export::MetricsReporter] reports metrics about this span processor
          def initialize(span_processor, metrics_reporter: nil, reset_on_fork: true)
            super(span_processor)
            @metrics_reporter = metrics_reporter || OpenTelemetry::SDK::Trace::Export::MetricsReporter
            @pending_spans = []
            @mutex = Mutex.new
          end

          # @see OpenTelemetry::SDK::Trace::SpanProcessor#on_start
          def on_start(span, parent_context)
            with_error_reporting do
              lock { pending_spans.push(span) }
              metrics_reporter.observe_value("gh.otel.pending_spans", value: pending_spans.size, labels: { "code.function": __method__ })
            end

            super
          end

          # @see OpenTelemetry::SDK::Trace::SpanProcessor#on_finish
          def on_finish(span)
            with_error_reporting do
              lock { pending_spans.delete(span) }
              metrics_reporter.observe_value("gh.otel.pending_spans", value: pending_spans.size, labels: { "code.function": __method__ })
            end

            super
          end

          # @see OpenTelemetry::SDK::Trace::SpanProcessor#shutdown
          def shutdown(**args)
            with_error_reporting do
              batch = lock { pending_spans.shift(pending_spans.size) }
              batch.reverse_each(&:finish)
              metrics_reporter.observe_value("gh.otel.pending_spans", value: pending_spans.size, labels: { "code.function": __method__ })
            end

            super
          end

          # @return [Boolean] true if the span buffer is empty
          def empty?
            result = with_error_reporting do
              lock { pending_spans.empty? }
            end
            result == true
          end

          # @api private
          #
          # Prevents forked processes from having a copy of the pending_spans from the parent process,
          # which would ultimately result in the same pending_spans being exported multiple times.
          #
          # It works in conjuction with the `reset_on_fork` option, which is enabled by default.
          # Users who disable `reset_on_fork` are responsible for ensuring that the pending_spans are not exported multiple times.
          def reset
            lock do
              pending_spans.clear
            end
          end

          private

          attr_reader :pending_spans

          def lock(&block)
            @mutex.synchronize(&block)
          end

          def with_error_reporting(&block)
            begin
              block.call
            rescue StandardError => e
              OpenTelemetry.handle_error(exception: e)
              metrics_reporter.add_to_counter("gh.otel.pending_spans.error.count", labels: { "error.type" => e.class.name })
            end
          end
        end
      end
    end
  end
end
