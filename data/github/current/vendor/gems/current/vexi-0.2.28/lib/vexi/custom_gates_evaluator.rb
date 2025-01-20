# frozen_string_literal: true
# typed: strict

module Vexi
  # Public: Vexi custom gates evaluator interface.
  module CustomGatesEvaluator
    extend T::Sig
    extend T::Helpers
    interface!

    include Kernel

    sig do
      abstract.params(feature_name: String, custom_gate_names: T::Array[String],
                      actors: T::Array[T.any(Actor, String)]).returns(T::Boolean)
    end
    def enabled?(feature_name, custom_gate_names, actors); end

    sig { abstract.returns String }
    def custom_gates_evaluator_name; end
  end
end
