# frozen_string_literal: true
# typed: strict

require "zlib"

module Vexi
  # Public: Vexi custom gates evalautor interface.
  class NonActorGateEvaluator
    extend T::Sig
    extend T::Helpers

    sig { params(feature_flag: FeatureFlag).returns(T::Boolean) }
    def self.evaluate_boolean_gate(feature_flag)
      feature_flag.boolean_gate
    end

    sig { params(feature_flag: FeatureFlag).returns(T::Boolean) }
    def self.evaluate_percentage_of_calls(feature_flag)
      Random.rand < (feature_flag.percentage_of_calls / 100.0)
    end

    # Private: this constant is used to support up to 3 decimal places in percentages.
    SCALING_FACTOR = 1_000
    private_constant :SCALING_FACTOR

    sig { params(feature_flag: FeatureFlag, actor_ids: T::Array[String]).returns(T::Boolean) }
    def self.evaluate_percentage_of_actors(feature_flag, actor_ids)
      return false if actor_ids.empty?

      id = feature_flag.name + actor_ids.sort.join

      Zlib.crc32(id) % (100 * SCALING_FACTOR) < feature_flag.percentage_of_actors * SCALING_FACTOR
    end

    sig { params(embedded_actor_ids: ActorCollection, actor_ids: T::Array[String]).returns(T::Boolean) }
    def self.evaluate_embedded_actors(embedded_actor_ids, actor_ids)
      return false if actor_ids.empty?

      actor_ids.any? do |actor|
        embedded_actor_ids[actor]
      end
    end
  end
end
