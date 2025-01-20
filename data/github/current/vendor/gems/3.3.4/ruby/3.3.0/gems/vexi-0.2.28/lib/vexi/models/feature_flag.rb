# frozen_string_literal: true
# typed: strict

require "json"
require "vexi/entity"
require "vexi/actor_collection"
require "vexi/hash_actor_collection"

module Vexi
  # FeatureFlag is the struct that represents a feature flag.
  class FeatureFlag
    extend T::Sig
    extend T::Helpers

    include Entity

    sig { params(name: String).void }
    attr_writer :name

    sig { returns(T::Boolean) }
    attr_accessor :boolean_gate

    sig { returns(Float) }
    attr_accessor :percentage_of_actors

    sig { returns(Float) }
    attr_accessor :percentage_of_calls

    sig { returns(T::Array[String]) }
    attr_accessor :segments

    sig { returns(T::Array[String]) }
    attr_accessor :custom_gates

    sig { returns(ActorCollection) }
    attr_accessor :actors

    sig { returns(String) }
    attr_accessor :default_segment

    sig { returns(T::Boolean) }
    attr_accessor :is_default_segment_embedded

    sig { void }
    def initialize
      @name = T.let("", String)
      @boolean_gate = T.let(false, T::Boolean)
      @percentage_of_actors = T.let(0.0, Float)
      @percentage_of_calls = T.let(0.0, Float)
      @segments = T.let([], T::Array[String])
      @custom_gates = T.let([], T::Array[String])
      @actors = T.let(HashActorCollection.new({}), ActorCollection)
      @default_segment = T.let("", String)
      @is_default_segment_embedded = T.let(false, T::Boolean)
    end

    sig { override.returns(String) }
    def name
      @name
    end

    sig { params(json: T::Hash[String, T.untyped]).returns(FeatureFlag) }
    def self.from_json(json)
      feature_flag = FeatureFlag.new
      feature_flag.actors = HashActorCollection.new({})
      json.each do |key, value|
        feature_flag.set_property(key, value)
        (json["embedded_actors"] || []).each do |actor_name|
          feature_flag.actors[actor_name] = true
        end
      end
      feature_flag
    end

    sig { params(name: String).returns(FeatureFlag) }
    def self.create_default(name)
      create_boolean_feature_flag(name, false)
    end

    sig { params(name: String, enabled: T::Boolean).returns(FeatureFlag) }
    def self.create_boolean_feature_flag(name, enabled)
      feature_flag = FeatureFlag.new
      feature_flag.name = name
      feature_flag.boolean_gate = enabled
      feature_flag.is_default_segment_embedded = true
      feature_flag
    end

    sig { params(feature_flag: FeatureFlag).returns(T::Hash[String, T.untyped]) }
    def self.to_h(feature_flag)
      {
        "name" => feature_flag.name,
        "state" => FeatureFlag.calculate_state(feature_flag),
        "percentage_of_calls" => feature_flag.percentage_of_calls,
        "percentage_of_actors" => feature_flag.percentage_of_actors,
        "custom_gates" => feature_flag.custom_gates,
        "embedded_actors" => feature_flag.actors.keys,
        "default_segment" => feature_flag.default_segment,
        "segments" => feature_flag.segments,
        "is_default_segment_embedded" => feature_flag.is_default_segment_embedded
      }
    end

    sig { params(feature_flag: FeatureFlag).returns(Integer) }
    def self.calculate_state(feature_flag)
      state = 0
      state = 2 if feature_flag.percentage_of_actors.positive? || feature_flag.percentage_of_calls.positive?
      state = 2 if feature_flag.custom_gates.length.positive?
      state = 2 if feature_flag.actors.length.positive?
      state = 1 if feature_flag.boolean_gate == false && state != 2
      state = 3 if feature_flag.boolean_gate == true
      state
    end

    sig { params(key: String, value: T.untyped).void }
    def set_property(key, value)
      value = value.to_f if %w[percentage_of_actors percentage_of_calls].include?(key)
      instance_variable_set("@#{key}", value) if instance_variable_defined?("@#{key}")
      @boolean_gate = true if key == "state" && value == 3
    end
  end
end
