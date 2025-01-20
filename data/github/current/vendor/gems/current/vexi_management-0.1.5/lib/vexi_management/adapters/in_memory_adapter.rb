# frozen_string_literal: true
# typed: strict

require 'vexi_management/adapter'
require 'vexi/adapters/in_memory_adapter'

module VexiManagement
  module Adapters
    # Public: VexiManagement::Adapter extension logic for Vexi::Adapters::InMemoryAdapter.
    # This should only be used if the vexi gem is installed.
    class InMemoryAdapter
      extend T::Sig
      extend T::Helpers

      include Adapter

      sig { params(vexi_adapter: Vexi::Adapters::InMemoryAdapter).void }
      def initialize(vexi_adapter)
        @vexi_adapter = vexi_adapter
      end

      # The VexiManagement::Adapter interface is technically implemented in vexi/lib/vexi/adapters/in_memory_adapter.rb,
      # but it does not include the VexiManagement::Adapter module directly to avoid adding gem dependencies.
      # This class is a wrapper around the Vexi::Adapters::InMemoryAdapter to provide the VexiManagement::Adapter
      # interface for use with vexi_management if needed, delegating the methods to Vexi::Adapters::InMemoryAdapter.

      sig { override.params(feature_flag: Vexi::FeatureFlag).void }
      def create(feature_flag)
        @vexi_adapter.create(feature_flag)
      end

      sig { override.params(name: T.any(String, Symbol)).returns(T.nilable(Vexi::FeatureFlag)) }
      def get(name)
        @vexi_adapter.get(name)
      end

      sig { override.params(name: T.any(String, Symbol)).void }
      def delete(name)
        @vexi_adapter.delete(name)
      end

      sig { override.params(name: T.any(String, Symbol)).void }
      def enable(name)
        @vexi_adapter.enable(name)
      end

      sig { override.params(name: T.any(String, Symbol)).void }
      def disable(name)
        @vexi_adapter.disable(name)
      end

      sig { override.params(name: T.any(String, Symbol), actor: T.any(String, Vexi::Actor)).void }
      def add_actor(name, actor)
        @vexi_adapter.add_actor(name, actor)
      end

      sig { override.params(name: T.any(String, Symbol), actor: T.any(String, Vexi::Actor)).void }
      def remove_actor(name, actor)
        @vexi_adapter.remove_actor(name, actor)
      end

      sig { override.params(name: T.any(String, Symbol), percentage: Float).void }
      def enable_percentage_of_calls(name, percentage)
        @vexi_adapter.enable_percentage_of_calls(name, percentage)
      end

      sig { override.params(name: T.any(String, Symbol), percentage: Float).void }
      def enable_percentage_of_actors(name, percentage)
        @vexi_adapter.enable_percentage_of_actors(name, percentage)
      end

      sig { override.params(name: T.any(String, Symbol), custom_gate: String).void }
      def add_custom_gate(name, custom_gate)
        @vexi_adapter.add_custom_gate(name, custom_gate)
      end

      sig { override.params(name: T.any(String, Symbol), custom_gate: String).void }
      def remove_custom_gate(name, custom_gate)
        @vexi_adapter.remove_custom_gate(name, custom_gate)
      end
    end
  end
end
