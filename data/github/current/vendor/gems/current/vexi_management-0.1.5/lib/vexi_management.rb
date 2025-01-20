# frozen_string_literal: true
# typed: strict

require 'sorbet-runtime'

require 'vexi/models/feature_flag'
require 'vexi/actor'

require 'vexi_management/adapter'
require 'vexi_management/version'

# Public: The VexiManagement module for feature management code.
module VexiManagement
  # Public: The VexiManagement class for performing feature flag management operations.
  class VexiManagement
    extend T::Sig

    sig { params(adapter: Adapter).void }
    def initialize(adapter)
      @adapter = adapter
    end

    sig { params(feature_flag: Vexi::FeatureFlag).void }
    def create(feature_flag)
      @adapter.create(feature_flag)
    end

    sig { params(name: T.any(String, Symbol)).returns(T.nilable(Vexi::FeatureFlag)) }
    def get(name)
      @adapter.get(name)
    end

    sig { params(name: T.any(String, Symbol)).void }
    def delete(name)
      @adapter.delete(name)
    end

    sig { params(name: T.any(String, Symbol)).void }
    def enable(name)
      @adapter.enable(name)
    end

    sig { params(name: T.any(String, Symbol)).void }
    def disable(name)
      @adapter.disable(name)
    end

    sig { params(name: T.any(String, Symbol), actor: T.any(String, Vexi::Actor)).void }
    def add_actor(name, actor)
      @adapter.add_actor(name, actor)
    end

    sig { params(name: T.any(String, Symbol), actor: T.any(String, Vexi::Actor)).void }
    def remove_actor(name, actor)
      @adapter.remove_actor(name, actor)
    end

    sig { params(name: T.any(String, Symbol), percentage: Float).void }
    def enable_percentage_of_calls(name, percentage)
      @adapter.enable_percentage_of_calls(name, percentage)
    end

    sig { params(name: T.any(String, Symbol), percentage: Float).void }
    def enable_percentage_of_actors(name, percentage)
      @adapter.enable_percentage_of_actors(name, percentage)
    end

    sig { params(name: T.any(String, Symbol), custom_gate: String).void }
    def add_custom_gate(name, custom_gate)
      @adapter.add_custom_gate(name, custom_gate)
    end

    sig { params(name: T.any(String, Symbol), custom_gate: String).void }
    def remove_custom_gate(name, custom_gate)
      @adapter.remove_custom_gate(name, custom_gate)
    end
  end
end
