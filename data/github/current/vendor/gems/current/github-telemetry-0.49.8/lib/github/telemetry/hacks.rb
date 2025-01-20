# frozen_string_literal: true

module GitHub
  module Telemetry
    # This module includes hacks for the monolith.
    # Please don't use these in your app.
    module Hacks
      module_function

      # This hack returns the "current" span from the context stack bound to a thread
      # It falls back to a backup span context in the case one does not exist.
      #
      # Please don't use this method.
      #
      # @param thread [Thread] the thread to get the current span from
      # @return [OpenTelemetry::Trace::Span] the current span
      def current_span_from(thread)
        context_storage = Array(thread[OpenTelemetry::Context.const_get(:STACK_KEY)]&.dup)
        context = context_storage.last ||  OpenTelemetry::Context.empty
        OpenTelemetry::Trace.current_span(context)
      end
    end
  end
end
