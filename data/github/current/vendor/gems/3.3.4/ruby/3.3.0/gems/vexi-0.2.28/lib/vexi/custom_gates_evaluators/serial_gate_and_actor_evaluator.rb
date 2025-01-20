# frozen_string_literal: true
# typed: strict

require "vexi/custom_gates_evaluator"

module Vexi
  # Public: Vexi Custom Gates evaluators that ship with the library.
  module CustomGatesEvaluators
    # Public: Serially evaluates each custom gate for each actor id or actor individually.
    # Does not support batching actors to a custom gate.
    class SerialGateAndActorEvaluator
      extend T::Sig
      extend T::Helpers

      include CustomGatesEvaluator

      sig do
        params(
          custom_gate_funcs: T::Hash[String, T.proc.params(feature_flag: String, actor: T.any(Actor, String)
        ).returns(T::Boolean)]).void
      end
      def initialize(custom_gate_funcs)
        @custom_gate_funcs = T.let(
          custom_gate_funcs,
          T::Hash[String, T.proc.params(feature_flag: String, actors: T.any(Actor, String)).returns(T::Boolean)]
        )
      end

      sig do
        override.params(
          feature_flag: String, custom_gate_names: T::Array[String], actors: T::Array[T.any(Actor, String)]
        ).returns(T::Boolean)
      end
      def enabled?(feature_flag, custom_gate_names, actors)
        # iterate through custom_gate_names and check if any of the custom_gate_funcs
        # return true for the given actor_ids
        # if any of the custom_gate_funcs return true, return true
        # if none of the custom_gate_funcs return true, return false
        # if custom_gate_names is empty, return false
        # if actor_ids is empty, return false
        # if custom_gate_funcs is empty, return false
        # if custom_gate_funcs is nil, return false

        Notifications.instrument_timing("#{custom_gates_evaluator_name}.is_enabled", { feature_flag: feature_flag }) do |is_enabled_context|
          next false if custom_gate_names.empty? || actors.empty? || @custom_gate_funcs.empty? || feature_flag.empty?

          is_enabled_context.capture_boolean(:result) do
            custom_gate_names.any? do |custom_gate_name|
              next false if custom_gate_name.empty?

              actors.any? do |actor|
                Notifications.instrument_timing("#{custom_gates_evaluator_name}.is_enabled_for_custom_gate", {
                  feature_flag: feature_flag,
                  custom_gate_name: custom_gate_name
                }) do |custom_gate_context|
                  custom_gate_context.capture_boolean(:result) { @custom_gate_funcs[custom_gate_name]&.call(feature_flag, actor) }
                end
              rescue StandardError => e
                context = { feature_flag: feature_flag, custom_gate_names: custom_gate_names }
                Notifications.instrument_exception("#{custom_gates_evaluator_name}.is_enabled",
                  "evaluation of custom gate failed",
                  e,
                  context
                )

                false
              end
            end
          end
        end
      end

      sig { override.returns String }
      def custom_gates_evaluator_name
        "serial_gate_and_actor_evaluator"
      end
    end
  end
end
