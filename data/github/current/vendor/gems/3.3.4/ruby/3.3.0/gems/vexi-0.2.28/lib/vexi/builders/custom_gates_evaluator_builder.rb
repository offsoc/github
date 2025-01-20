# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"

require "vexi/configuration"
require "vexi/custom_gates_evaluators/serial_gate_and_actor_evaluator"

module Vexi
  module Builders
    class CustomGatesEvaluatorBuilder
      extend T::Sig

      sig { params(config: Configuration).void }
      def initialize(config)
        @config = T.let(config, Configuration)
      end

      sig do
        params(
          custom_gate_funcs: T::Hash[String, T.proc.params(feature_flag: String, actor: T.any(Actor, String)
        ).returns(T::Boolean)]).void
      end
      def serial_gate_and_actor_evaluator(custom_gate_funcs)
        @config.custom_gates_evaluator = CustomGatesEvaluators::SerialGateAndActorEvaluator.new(custom_gate_funcs)
      end

      sig { params(custom_gates_evaluator: CustomGatesEvaluator).void }
      def custom(custom_gates_evaluator)
        @config.custom_gates_evaluator = custom_gates_evaluator
      end
    end
  end
end
