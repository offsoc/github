# frozen_string_literal: true
# typed: strict

require "fnv"
require "sorbet-runtime"

require "vexi/abstract_entity_service"
require "vexi/models/get_entity_response"

module Vexi
  # Public: Vexi services.
  module Services
    # Public: Segment service responsible for fetching segments from the cache or the adapter.
    class SegmentService < AbstractEntityService
      extend T::Sig
      extend T::Helpers
      extend T::Generic # Provides `type_member` helper

      EntityType = type_member { { fixed: Segment } }

      sig { params(adapter: Adapter, cache_config: T.nilable(CacheConfig)).void }
      def initialize(adapter, cache_config = nil)
        super(adapter, cache_config)
      end

      sig { override.returns(T::Class[EntityType]) }
      def entity_type
        Segment
      end

      sig { override.returns(String) }
      def entity_type_name
        "segment"
      end

      private

      sig { override.params(name: String).returns(String) }
      def get_cache_key(name)
        "vexi:sg:#{name}"
      end

      sig do
        override.params(names: T::Array[String]).returns(T::Array[GetEntityResponse])
      end
      def get_entity_responses(names);
        @adapter.get_segments(names)
      end

      sig { override.params(name: String).returns(EntityType) }
      def get_default_entity_instance(name)
        Segment.create_default(name)
      end

      # Private: Generate a cache key for the given segment names and actors using FNV.
      sig { params(segment_names: T::Array[String], actor_ids: T::Array[String]).returns(String) }
      def generate_segments_actor_combination_cache_key(segment_names, actor_ids)
        # Compute a hash of the segment_names and actor_ids
        segments_hash = FNV.new.fnv1a_64(segment_names.join(","))
        actors_hash = FNV.new.fnv1a_64(actor_ids.join(","))
        "vexi:sg-actors:#{segments_hash}:#{actors_hash}"
      end

      # Private: Returns the enabled boolean from the cache for the provided key. If the key is not found, returns nil.
      sig { params(context: T::Hash[Symbol, T.untyped], cache_key: String).returns(T.nilable(T::Boolean)) }
      def get_segments_actors_combination_is_enabled_from_cache(context, cache_key)
        return nil unless @cache_config&.cache

        cache = @cache_config.cache
        cached_values = cache.mget([cache_key])
        cache_hit = !cached_values.empty?

        Notifications.instrument_cache_hit_or_miss("segments_actors_combination", cache_hit, { source: "cache" })
        cache_hit ? cached_values[0] : nil
      rescue StandardError => e
        # Log the error and increment error counter metric
        Notifications.instrument_exception("#{cache&.cache_name}.mget",
          "unexpected error when retrieving from cache",
          e,
          context.merge({ stage: "cache_mget" })
        )
      end

      sig { params(context: T::Hash[Symbol, T.untyped], cache_key: String, enabled: T::Boolean).void }
      def set_segments_actors_combination_is_enabled_in_cache(context, cache_key, enabled)
        return unless @cache_config&.cache

        cache = @cache_config.cache
        cache.mset({ cache_key => enabled }, @cache_config.ttl)
      rescue StandardError => e
        Notifications.instrument_exception("#{cache&.cache_name}.mset",
          "unexpected error when writing to cache",
          e,
          context.merge({ stage: "cache_mset" })
        )
      end
    end
  end
end
