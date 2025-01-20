# frozen_string_literal: true
# typed: strict

require "vexi/adapter"

module Vexi
  module Adapters
    # Public: In memory adapter mode enum
    class InMemoryAdapterMode < T::Enum
      enums do
        DisabledByDefault = new
        EnabledByDefault = new
      end
    end

    # Public: In memory adapter for Vexi.
    class InMemoryAdapter
      extend T::Sig
      extend T::Helpers

      include Adapter

      sig { params(mode: InMemoryAdapterMode, exception_feature_flags: T::Array[String]).void }
      def initialize(mode, exception_feature_flags: [])
        @exception_feature_flags = exception_feature_flags

        @default_enabled = T.let(case mode
                                 when InMemoryAdapterMode::DisabledByDefault then false
                                 when InMemoryAdapterMode::EnabledByDefault then true
                                 else T.absurd(mode)
                                 end, T::Boolean)

        @feature_flags = T.let({}, T::Hash[String, FeatureFlag])

        # Mark as dirty and reset to setup the initial state of @feature_flags using @exception_feature_flags
        @dirty = T.let(true, T::Boolean)
        reset
      end

      sig { override.params(names: T::Array[String]).returns(T::Array[GetFeatureFlagResponse]) }
      def get_feature_flags(names)
        feature_flags = []
        names.each do |name|
          feature_flag = @feature_flags[name] || FeatureFlag.create_boolean_feature_flag(name, @default_enabled)
          @feature_flags[name] = feature_flag
          feature_flags << GetFeatureFlagResponse.new(
            name: name,
            feature_flag: feature_flag
          )
        end
        feature_flags
      end

      sig { override.params(_names: T::Array[String]).returns(T::Array[GetSegmentResponse]) }
      def get_segments(_names)
        []
      end

      sig { override.returns String }
      def adapter_name
        "in_memory"
      end

      # Below is the implementation of VexiManagement::Adapter to support using it with vexi_management,
      # but that is not included directly here to avoid adding gem dependencies.
      # For testing this can be used with vexi_management if desired, but alternatively
      # the methods can be used directly on the InMemoryAdapter class.

      # Creates a new feature flag with the given name. Will raise an error if the feature flag already exists.
      sig { params(feature_flag: FeatureFlag).void }
      def create(feature_flag)
        existing_feature_flag = @feature_flags[feature_flag.name]
        unless existing_feature_flag.nil?
          raise ArgumentError, "Feature flag with name #{feature_flag.name} already exists"
        end

        @feature_flags[feature_flag.name] = feature_flag
        @dirty = true
      end

      sig { params(name: T.any(String, Symbol)).returns(T.nilable(FeatureFlag)) }
      def get(name)
        feature_flag_responses = get_feature_flags([name.to_s])
        first_response = feature_flag_responses.first

        return nil unless first_response&.feature_flag

        first_response.feature_flag
      end

      # Deletes a feature flag from the adapter.
      sig { params(name: T.any(String, Symbol)).void }
      def delete(name)
        deleted_flag = @feature_flags.delete(name.to_s)
        @dirty = true unless deleted_flag.nil?
      end

      # Fully enables the feature flag. It will create it if it does not exist.
      sig { params(name: T.any(String, Symbol)).void }
      def enable(name)
        feature_flag = @feature_flags[name.to_s] ||= FeatureFlag.create_boolean_feature_flag(name.to_s, true)
        feature_flag.boolean_gate = true
        @dirty = true
      end

      # Disables the feature flag. It will create it if it does not exist.
      sig { params(name: T.any(String, Symbol)).void }
      def disable(name)
        feature_flag = @feature_flags[name.to_s]
        if feature_flag
          # disable boolean_gate and clear all other gates
          feature_flag.boolean_gate = false
          feature_flag.percentage_of_actors = 0.0
          feature_flag.percentage_of_calls = 0.0
          feature_flag.custom_gates = []
          feature_flag.actors = HashActorCollection.new({})
          feature_flag.segments = []
        else
          feature_flag = FeatureFlag.create_boolean_feature_flag(name.to_s, false)
          @feature_flags[name.to_s] = feature_flag
        end
        @dirty = true
      end

      # Adds an actor to the feature flag. Requires the feature flag to exist.
      sig { params(name: T.any(String, Symbol), actor: T.any(String, Actor)).void }
      def add_actor(name, actor)
        feature_flag = @feature_flags[name.to_s]
        raise ArgumentError, "Feature flag with name #{name} does not exist" unless feature_flag

        actor_id = if actor.is_a?(Actor)
                     actor.vexi_id
                   else
                     actor
                   end

        feature_flag.actors[actor_id] = true
        @dirty = true
      end

      # Removes an actor from the feature flag. Requires the feature flag to exist.
      sig { params(name: T.any(String, Symbol), actor: T.any(String, Actor)).void }
      def remove_actor(name, actor)
        feature_flag = @feature_flags[name.to_s]
        raise ArgumentError, "Feature flag with name #{name} does not exist" unless feature_flag

        actor_id = if actor.is_a?(Actor)
                     actor.vexi_id
                   else
                     actor
                   end

        feature_flag.actors.delete(actor_id)
        @dirty = true
      end

      # Enables the feature flag for a percentage of calls. Requires the feature flag to exist.
      sig { params(name: T.any(String, Symbol), percentage: Float).void }
      def enable_percentage_of_calls(name, percentage)
        feature_flag = @feature_flags[name.to_s]
        raise ArgumentError, "Feature flag with name #{name} does not exist" unless feature_flag

        feature_flag.percentage_of_calls = percentage
        @dirty = true
      end

      # Enables the feature flag for a percentage of actors. Requires the feature flag to exist.
      sig { params(name: T.any(String, Symbol), percentage: Float).void }
      def enable_percentage_of_actors(name, percentage)
        feature_flag = @feature_flags[name.to_s]
        raise ArgumentError, "Feature flag with name #{name} does not exist" unless feature_flag

        feature_flag.percentage_of_actors = percentage
        @dirty = true
      end

      # Adds a custom gate to the feature flag. Requires the feature flag to exist.
      sig { params(name: T.any(String, Symbol), custom_gate: String).void }
      def add_custom_gate(name, custom_gate)
        feature_flag = @feature_flags[name.to_s]
        raise ArgumentError, "Feature flag with name #{name} does not exist" unless feature_flag

        feature_flag.custom_gates << custom_gate unless feature_flag.custom_gates.include?(custom_gate)
        @dirty = true
      end

      # Removes a custom gate from the feature flag. Requires the feature flag to exist.
      sig { params(name: T.any(String, Symbol), custom_gate: String).void }
      def remove_custom_gate(name, custom_gate)
        feature_flag = @feature_flags[name.to_s]
        raise ArgumentError, "Feature flag with name #{name} does not exist" unless feature_flag

        feature_flag.custom_gates.delete(custom_gate)
        @dirty = true
      end

      # Resets the adapter to its initial state.
      sig { void }
      def reset
        return unless @dirty

        # Add all the exception feature flags to a new hash with the inverse of the default value
        @feature_flags = @exception_feature_flags.each_with_object({}) do |name, hash|
          hash[name] = FeatureFlag.create_boolean_feature_flag(name, !@default_enabled)
        end
        @dirty = false
      end
    end
  end
end
