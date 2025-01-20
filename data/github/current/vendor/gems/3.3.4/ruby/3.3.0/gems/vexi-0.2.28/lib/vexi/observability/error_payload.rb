# frozen_string_literal: true
# typed: strict

require "active_support"
require "active_support/notifications"

module Vexi
  module Observability
    # Vexi payload contained in error notifications
    class ErrorPayload
      extend T::Sig
      extend T::Helpers

      sig { params(event: ActiveSupport::Notifications::Event).void }
      def initialize(event)
        @operation = T.let(event.payload[:operation] || "unspecified", String)
        @message = T.let(event.payload[:message] || "", String)
        @exception = T.let(event.payload[:exception] || nil, T.nilable(Exception))
        @context_tags = T.let(event.payload,
                              T::Hash[Symbol, T.any(String, Numeric, Time, T::Boolean, Exception, T::Array[String])])
        @feature_flag = T.let((@context_tags[:feature_flag] || "").to_s, String)
        @segments = T.let(T.cast(@context_tags[:segments] || [], T::Array[String]), T::Array[String])
        @stage = T.let((@context_tags[:stage] || "").to_s, String)
        @custom_gate_names = T.let(T.cast(@context_tags[:custom_gate_names] || [], T::Array[String]), T::Array[String])
        @actor_ids = T.let(T.cast(@context_tags[:actor_ids] || [], T::Array[String]), T::Array[String])
      end

      # Public: The operation that the error occured inside. Defaults to 'unspecified'
      sig { returns(String) }
      attr_reader :operation

      # Public: The message associated with the error
      sig { returns(String) }
      attr_reader :message

      # Public: The exception associated with the error (optional)
      sig { returns(T.nilable(Exception)) }
      attr_reader :exception

      # Public: The context tags for the error
      sig { returns(T::Hash[Symbol, T.any(String, Numeric, Time, T::Boolean, Exception, T::Array[String])]) }
      attr_reader :context_tags

      # Public: The feature flag for the error (optional)
      sig { returns(String) }
      attr_reader :feature_flag

      # Public: The segment names for the error (optional)
      sig { returns(T::Array[String]) }
      attr_reader :segments

      # Public: The stage of processing for the error (optional)
      sig { returns(String) }
      attr_reader :stage

      # Public: The custom gate names for the error when custom gate evaluators are used (optional)
      sig { returns(T::Array[String]) }
      attr_reader :custom_gate_names

      # Public: The actor ids for the error when actor ids are used (optional)
      sig { returns(T::Array[String]) }
      attr_reader :actor_ids
    end
  end
end
