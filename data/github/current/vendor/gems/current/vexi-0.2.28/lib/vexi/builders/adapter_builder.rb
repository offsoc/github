# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"

require "vexi/configuration"
require "vexi/adapters/feature_flag_hub_adapter"
require "vexi/adapters/file_adapter"
require "vexi/adapters/in_memory_adapter"

module Vexi
  module Builders
    class AdapterBuilder
      extend T::Sig

      sig { params(config: Configuration).void }
      def initialize(config)
        @config = T.let(config, Configuration)
      end

      sig { params(hmac_key: String, url: String).returns(Adapter) }
      def monolith_optimized_feature_flag_data_from_url(hmac_key, url)
        @config.adapter = Adapters::MonolithOptimizedFeatureFlagDataAdapter.new_from_url(hmac_key, url)
      end

      sig { params(conn: Faraday::Connection).returns(Adapter) }
      def monolith_optimized_feature_flag_data_from_connection(conn)
        @config.adapter = Adapters::MonolithOptimizedFeatureFlagDataAdapter.new_from_connection(conn)
      end

      sig { params(hmac_key: String).returns(Adapter) }
      def monolith_optimized_feature_flag_data_from_env(hmac_key)
        @config.adapter = Adapters::MonolithOptimizedFeatureFlagDataAdapter.new_from_env(hmac_key)
      end

      sig { params(hmac_key: String, url: String).returns(Adapter) }
      def feature_flag_hub_from_url(hmac_key, url)
        @config.adapter = Adapters::FeatureFlagHubAdapter.new_from_url(hmac_key, url)
      end

      sig { params(conn: Faraday::Connection).returns(Adapter) }
      def feature_flag_hub_from_connection(conn)
        @config.adapter = Adapters::FeatureFlagHubAdapter.new_from_connection(conn)
      end

      sig { params(hmac_key: String).returns(Adapter) }
      def feature_flag_hub_from_env(hmac_key)
        @config.adapter = Adapters::FeatureFlagHubAdapter.new_from_env(hmac_key)
      end

      sig { params(adapter: Adapter).void }
      def custom(adapter)
        @config.adapter = adapter
      end

      sig { params(mode: Adapters::InMemoryAdapterMode, exception_feature_flags: T::Array[String]).void }
      def in_memory(mode, exception_feature_flags: [])
        @config.adapter = Adapters::InMemoryAdapter.new(mode, exception_feature_flags: exception_feature_flags)
      end

      sig { params(feature_flag_base_path: String, segments_base_path: String).void }
      def file(feature_flag_base_path, segments_base_path)
        @config.adapter = Adapters::FileAdapter.new(feature_flag_base_path, segments_base_path)
      end
    end
  end
end
