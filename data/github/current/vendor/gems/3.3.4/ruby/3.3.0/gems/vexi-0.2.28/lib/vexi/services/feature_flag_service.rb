# frozen_string_literal: true
# typed: strict

require "vexi/models/get_entity_response"

module Vexi
  # Public: Vexi services.
  module Services
    # Public: Feature Flag Service responsible for fetching feature flags from the cache or adapter.
    class FeatureFlagService < AbstractEntityService
      extend T::Sig
      extend T::Helpers
      extend T::Generic # Provides `type_member` helper

      EntityType = type_member { { fixed: FeatureFlag } }

      sig { params(adapter: Adapter, cache_config: T.nilable(CacheConfig)).void }
      def initialize(adapter, cache_config = nil)
        super(adapter, cache_config)
      end

      sig { override.returns(T::Class[EntityType]) }
      def entity_type
        FeatureFlag
      end

      sig { override.returns(String) }
      def entity_type_name
        "feature_flag"
      end

      private

      sig { override.params(name: String).returns(String) }
      def get_cache_key(name)
        "vexi:ff:#{name}"
      end

      sig do
        override.params(names: T::Array[String]).returns(T::Array[GetEntityResponse])
      end
      def get_entity_responses(names);
        @adapter.get_feature_flags(names)
      end

      sig { override.params(name: String).returns(EntityType) }
      def get_default_entity_instance(name)
        FeatureFlag.create_default(name)
      end
    end
  end
end
