# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"

module Vexi
  # Public: Vexi service is an abstract base class. It has a generic get to fetch entities from the adapter or cache.
  class AbstractEntityService
    extend T::Sig
    extend T::Helpers
    extend T::Generic # Provides `type_member` helper
    abstract!

    include Kernel

    EntityType = type_member { { upper: Entity } } # Makes the `Service` class generic

    sig { params(adapter: Adapter, cache_config: T.nilable(CacheConfig)).void }
    def initialize(adapter, cache_config = nil)
      @adapter = adapter
      @cache_config = cache_config
      @memoizing = T.let(false, T::Boolean)
      @memoized_entities = T.let({}, T::Hash[String, EntityType])
    end

    sig { abstract.returns(T::Class[EntityType]) }
    def entity_type; end

    sig { abstract.returns(String) }
    def entity_type_name; end

    sig { params(value: T::Boolean).void }
    def memoize=(value)
      @memoized_entities.clear
      @memoizing = value
    end

    sig do
      params(
        fetch_directly_from_adapter: T::Boolean,
        cache_without_expiry: T::Boolean,
        _allow_context_overrides: T::Boolean,
        names: T::Array[String]
      ).returns(T::Array[EntityType])
    end
    def get(fetch_directly_from_adapter: false, cache_without_expiry: false, _allow_context_overrides: false, names: [])
      # Validate parameters
      return [] if names.empty?

      instrumentation_context = { caching: !!@cache_config, memoizing: @memoizing, fetch_directly_from_adapter: fetch_directly_from_adapter }
      entities_to_fetch = T.let(names, T::Array[String])

      entities = Notifications.instrument_timing("memoization.fetch", instrumentation_context) do |ctx|
        ctx.capture_collection_size(:entities_count) { get_entities_from_memoization(entities_to_fetch, fetch_directly_from_adapter) }
      end
      entities = entities
      entities_to_fetch -= entities.map(&:name)

      return entities if entities_to_fetch.empty?

      cached_entities = Notifications.instrument_timing("cache.fetch", instrumentation_context) do |ctx|
        ctx.capture_collection_size(:entities_count) { get_entities_from_cache(entities_to_fetch, fetch_directly_from_adapter) }
      end
      entities = entities.concat(cached_entities)
      entities_to_fetch -= cached_entities.map(&:name)

      return entities if entities_to_fetch.empty?

      adapter_entities = Notifications.instrument_timing("adapter.fetch", instrumentation_context) do |ctx|
        ctx.capture_collection_size(:entities_count) { get_entities_from_adapter(entities_to_fetch, cache_without_expiry) }
      end
      entities.concat(adapter_entities)
    end

    private

    sig { abstract.params(name: String).returns(String) }
    def get_cache_key(name); end

    sig { abstract.params(names: T::Array[String]).returns(T::Array[GetEntityResponse]) }
    def get_entity_responses(names); end

    sig { abstract.params(name: String).returns(EntityType) }
    def get_default_entity_instance(name); end

    sig { params(names: T::Array[String]).returns(T::Array[String]) }
    def get_cache_keys(names)
      names.map { |name| get_cache_key(name) }
    end

    sig { params(entity_names: T::Array[String], fetch_directly_from_adapter: T::Boolean).returns(T::Array[EntityType]) }
    def get_entities_from_memoization(entity_names, fetch_directly_from_adapter)
      return [] unless @memoizing
      return [] if fetch_directly_from_adapter

      entity_names.each_with_object([]) do |entity_name, fetched_entities|
        entity = @memoized_entities[entity_name]
        next unless entity

        Notifications.instrument_cache_hit_or_miss(entity_type_name, true, { source: "memoization" })
        fetched_entities.push(entity)
      end
    end

    sig { params(entity_names: T::Array[String], fetch_directly_from_adapter: T::Boolean).returns(T::Array[EntityType]) }
    def get_entities_from_cache(entity_names, fetch_directly_from_adapter)
      return [] if fetch_directly_from_adapter
      return [] if @cache_config.nil?
      return [] if entity_names.empty?

      cached_entities = T.let(@cache_config.cache.mget(get_cache_keys(entity_names)), T::Array[EntityType])

       # If memoization is enabled, add entities retrieved from cache to memoized entities
      cached_entities.each do |entity|
        Notifications.instrument_cache_hit_or_miss(entity_type_name, true, { source: "cache" })

        if @memoizing
          @memoized_entities[entity.name] = entity
        end
      end

      cached_entities
    end

    sig { params(entity_names: T::Array[String], cache_without_expiry: T::Boolean).returns(T::Array[EntityType]) }
    def get_entities_from_adapter(entity_names, cache_without_expiry)
      # Fetch entities from the adapter and cache them if a cache is present
      # For feature flags, we'll want to cache the negative entry
      entities = T.let([], T::Array[EntityType])
      entities_to_cache = T.let({}, T::Hash[String, T.untyped])

      responses = get_entity_responses(entity_names)

      responses.each do |response|
        next unless response.error.nil?
        next unless response.entity

        Notifications.instrument_cache_hit_or_miss(entity_type_name, false, { source: "adapter" })

        entity = T.cast(response.entity, EntityType)
        entities.push(entity)

        entity_name = response.entity.name
        entities_to_cache[get_cache_key(entity_name)] = entity
      end

      @cache_config.cache.mset(entities_to_cache, cache_without_expiry ? Cache::TTL_NEVER_EXPIRE : @cache_config.ttl) if @cache_config

      # Any entities that were not found in the response should be created as default instances and cached
      not_found_entity_names = entity_names - entities.map(&:name)
      if not_found_entity_names.any?
        not_found_entities_to_cache = not_found_entity_names.each_with_object({}) do |name, obj|
          entity = get_default_entity_instance(name)
          entities.push(entity)
          obj[get_cache_key(name)] = entity
        end
        @cache_config.cache.mset(not_found_entities_to_cache, @cache_config.not_found_ttl) if @cache_config
      end

      if @memoizing
        entities.each do |entity|
          @memoized_entities[entity.name] = entity
        end
      end

      entities
    end
  end
end
