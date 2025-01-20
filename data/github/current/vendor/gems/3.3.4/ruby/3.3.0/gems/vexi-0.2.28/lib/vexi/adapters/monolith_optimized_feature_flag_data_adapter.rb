# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"

require "vexi/adapter"
require "vexi/errors"
require "feature_management_feature_flags"
require "vexi/adapters/array_actor_collection"

FFDV2 = FeatureManagement::FeatureFlags::Data::V2

module Vexi
  module Adapters
    # Public: File adapter for Vexi.
    class MonolithOptimizedFeatureFlagDataAdapter
      extend T::Sig
      include Adapter
      DEFAULT_TIMEOUT = 1.0 # seconds
      DEFAULT_OPEN_TIMEOUT = 1.0 # seconds
      DEFAULT_MAX_RETRIES = 3

      sig { params(hmac_key: String, url: String).returns(MonolithOptimizedFeatureFlagDataAdapter) }
      def self.new_from_url(hmac_key, url)
        ffd_connection = connection(hmac_key, url)
        client = T.let(
          FFDV2::MonolithOptimizedChecksClient.new(ffd_connection), FFDV2::MonolithOptimizedChecksClient
        )
        new(client)
      end

      sig { params(conn: Faraday::Connection).returns(MonolithOptimizedFeatureFlagDataAdapter) }
      def self.new_from_connection(conn)
        client = T.let(
          FFDV2::MonolithOptimizedChecksClient.new(conn), FFDV2::MonolithOptimizedChecksClient
        )
        new(client)
      end

      sig { params(hmac_key: String).returns(MonolithOptimizedFeatureFlagDataAdapter) }
      def self.new_from_env(hmac_key)
        ffd_connection = connection(hmac_key, feature_flag_data_url)
        client = T.let(
          FFDV2::MonolithOptimizedChecksClient.new(ffd_connection), FFDV2::MonolithOptimizedChecksClient
        )
        new(client)
      end

      sig { override.params(names: T::Array[String]).returns(T::Array[GetFeatureFlagResponse]) }
      def get_feature_flags(names)
        flags = []
        req = FFDV2::MonolithOptimizedGetFeatureFlagsRequest.new(names: names)
        resp = @client.get_feature_flags(req)

        # Check if resp is nil
        unless resp
          raise StandardError, "Error fetching feature flags. Response is nil."
        end

        unless resp.error.nil?
          error_message = resp.error.meta[:body]
          raise StandardError,
                "Error fetching feature flags with status #{resp.error&.code}. Error message: '#{error_message}'"
        end

        feature_flags_hash = !resp.data.nil? ? create_feature_flags_found_hash(resp.data.to_h) : {}

        names.each do |name|
          error = feature_flags_hash[name] ? nil : Errors::FeatureFlagNotFoundError.new(name)
          flags << GetFeatureFlagResponse.new(name: name, feature_flag: feature_flags_hash[name], error: error)
        end

        flags
      end

      sig { override.params(names: T::Array[String]).returns(T::Array[GetSegmentResponse]) }
      def get_segments(names)
        segments = []

        req = FFDV2::GetSegmentsRequest.new(names: names)
        resp = @client.get_segments(req)

        # Check if resp is nil
        unless resp
          raise StandardError, "Error fetching segments. Response is nil."
        end

        unless resp.error.nil?
          error_message = resp.error.meta[:body]
          raise StandardError,
                "Error fetching segments with status #{resp.error&.code}. Error message: '#{error_message}'"
        end

        segments_hash = !resp.data.nil? ? create_segments_found_hash(resp.data.to_h) : {}

        names.each do |name|
          error = segments_hash[name] ? nil : Errors::SegmentNotFoundError.new(name)
          segments << GetSegmentResponse.new(name: name, segment: segments_hash[name], error: error)
        end

        segments
      end

      sig { override.returns(String) }
      def adapter_name
        "monolith_optimized_feature_flag_data"
      end

      private

      sig { params(hmac_key: String, url: String).returns(Faraday::Connection) }
      def self.connection(hmac_key, url)
        ts = Time.now.to_i.to_s
        digest = OpenSSL::Digest.new("sha256")
        sign_bytes = OpenSSL::HMAC.digest(digest, hmac_key, ts)
        sign_hex = sign_bytes.unpack1("H*")
        Faraday.new(url) do |conn|
          conn.headers["Request-HMAC"] = "#{ts}.#{sign_hex}"

          ## TODO: Add adapter version/sha to the user agent header?
          conn.headers["User-Agent"] = "monolith-optimized-feature-flag-data-adapter"
        end
      end
      private_class_method :connection

      sig { returns(String) }
      def self.feature_flag_data_url
        stamp = ENV["KUBE_CLUSTER_STAMP"]

        raise Errors::ValidationError, "KUBE_CLUSTER_STAMP environment variable is not set" if stamp.nil?

        return "http://localhost:8010/twirp" if stamp == "development"

        # TODO: Add option to return the istio/cluster.local URL
        # return fmt.Sprintf("http://feature-flag-data.feature-flag-data-%s.svc.cluster.local:8010", stamp)

        # dotcom has a different url format
        return "https://feature-flag-data-dotcom.service.iad.github.net" if stamp == "dotcom"

        # proxima stamps
        "https://feature-flag-data-#{stamp}.service.#{stamp}.github.net"
      end
      private_class_method :feature_flag_data_url

      sig { params(client: FFDV2::MonolithOptimizedChecksClient).void }
      def initialize(client)
        @client = client
      end

      sig { params(response: T::Hash[Symbol, T.untyped]).returns(FeatureFlag) }
      def convert_feature_flag_response(response)
        state = FeatureManagement::FeatureFlags::Data::V2::FeatureFlagState.resolve(response[:state])
        FeatureFlag.new.tap do |ff|
          ff.name = response[:name]
          ff.boolean_gate = state == FeatureManagement::FeatureFlags::Data::V2::FeatureFlagState::SHIPPED
          ff.percentage_of_actors = response[:percentage_of_actors]
          ff.percentage_of_calls = response[:percentage_of_calls]
          ff.segments = response[:segments]
          ff.custom_gates = response[:custom_gates]
          ff.default_segment = response[:default_segment]
          ff.is_default_segment_embedded = true
          ff.actors = ArrayActorCollection.new(response[:default_segment_actors])
        end
      end

      sig { params(response: T::Hash[Symbol, T.untyped]).returns(Segment) }
      def convert_segment_response(response)
        segment = Segment.new
        segment.name = response[:name]
        segment.actors = ArrayActorCollection.new(response[:actors])
        segment
      end

      sig { params(data: T::Hash[Symbol, T.untyped]).returns(T::Hash[String, FeatureFlag]) }
      def create_feature_flags_found_hash(data)
        feature_flags_hash = {}
        data[:feature_flags].each do |flag|
          feature_flags_hash[flag[:name]] = convert_feature_flag_response(flag)
        end
        feature_flags_hash
      end

      sig { params(data: T::Hash[Symbol, T.untyped]).returns(T::Hash[String, Segment]) }
      def create_segments_found_hash(data)
        data[:segments].each_with_object({}) do |segment, segments_hash|
          segments_hash[segment[:name]] = convert_segment_response(segment)
        end
      end
    end
  end
end
