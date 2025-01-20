# frozen_string_literal: true
# typed: strict

require "active_support"
require "active_support/notifications"

module Vexi
  module Observability
    # Vexi payload contained in cache-hit-or-miss notifications
    class CacheHitOrMissPayload
      extend T::Sig
      extend T::Helpers

      sig { params(event: ActiveSupport::Notifications::Event).void }
      def initialize(event)
        @cached_object_type = T.let(event.payload[:cached_object_type] || "unspecified", String)
        @cache_hit = T.let(event.payload[:cache_hit], T::Boolean)
        @context_tags = T.let(event.payload,
                              T::Hash[Symbol, T.any(String, Numeric, Time, T::Boolean, Exception, T::Array[String])])
      end

      # Public: The type of cached cache that was measured. Example: segments_actors_combination
      sig { returns(String) }
      attr_reader :cached_object_type

      # Public: Whether it was a cache hit or miss
      sig { returns(T::Boolean) }
      attr_reader :cache_hit

      # Public: The context tags for the measurement
      sig { returns(T::Hash[Symbol, T.any(String, Numeric, Time, T::Boolean, Exception, T::Array[String])]) }
      attr_reader :context_tags
    end
  end
end
