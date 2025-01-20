# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"

require "vexi/adapter"
require "vexi/errors"
require "feature_management_feature_flags"

FFDV1 = FeatureManagement::FeatureFlags::Data::V1

module Vexi
  module Adapters
    # Public: File adapter for Vexi.
    class FeatureFlagHubAdapter
      extend T::Sig
      include Adapter
      DEFAULT_TIMEOUT = 1.0 # seconds
      DEFAULT_OPEN_TIMEOUT = 1.0 # seconds
      DEFAULT_MAX_RETRIES = 3

      sig { params(hmac_key: String, url: String).returns(FeatureFlagHubAdapter) }
      def self.new_from_url(hmac_key, url)
        ffh_connection = connection(hmac_key, url)
        client = T.let(
          FFDV1::ChecksClient.new(ffh_connection), FFDV1::ChecksClient
        )
        new(client)
      end

      sig { params(conn: Faraday::Connection).returns(FeatureFlagHubAdapter) }
      def self.new_from_connection(conn)
        client = T.let(
          FFDV1::ChecksClient.new(conn), FFDV1::ChecksClient
        )
        new(client)
      end

      sig { params(hmac_key: String).returns(FeatureFlagHubAdapter) }
      def self.new_from_env(hmac_key)
        ffh_connection = connection(hmac_key, feature_flag_hub_url)
        client = T.let(
          FFDV1::ChecksClient.new(ffh_connection), FFDV1::ChecksClient
        )
        new(client)
      end

      sig { override.params(names: T::Array[String]).returns(T::Array[GetFeatureFlagResponse]) }
      def get_feature_flags(names)
        flags = []
        req = FFDV1::ListFeatureFlagsRequest.new(names: names)
        resp = @client.list_feature_flags(req)
        unless resp.error.nil?
          error_message = resp.error.meta[:body]
          raise StandardError,
                "Error fetching feature flags with status #{resp.error&.code}. Error message: '#{error_message}'"
        end

        feature_flags_hash = !resp.data.nil? ? create_feature_flags_found_hash(resp.data.to_h) : {}

        names.each do |name|
          flags << if feature_flags_hash[name]
                     GetFeatureFlagResponse.new(name: name, feature_flag: feature_flags_hash[name],
                                                error: nil)
                   else
                     GetFeatureFlagResponse.new(name: name, feature_flag: nil,
                                                error: Errors::FeatureFlagNotFoundError.new(name))
                   end
        end

        flags
      end

      sig { override.params(names: T::Array[String]).returns(T::Array[GetSegmentResponse]) }
      def get_segments(names)
        segments = []
        names.each do |name|
          req = FFDV1::GetSegmentRequest.new(name: name)
          resp = @client.get_segment(req)
          if !resp.error.nil? && resp.error.code != :not_found
            error_message = resp.error.meta[:body]
            raise StandardError,
                  "Error fetching segments with status #{resp.error&.code}. Error message: '#{error_message}'"
          end

          segments << if !resp.data.nil?
                        GetSegmentResponse.new(name: name, segment: convert_segment_response(resp.data.to_h),
                                               error: nil)
                      else
                        GetSegmentResponse.new(name: name, segment: nil,
                                               error: Errors::SegmentNotFoundError.new(name))
                      end
        end
        segments
      end

      sig { override.returns(String) }
      def adapter_name
        "feature_flag_hub"
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
          # TODO: Have the checks not need to add github user header.
          conn.headers["X-GitHub-User"] = "feature-flag-hub-adapter"
        end
      end
      private_class_method :connection

      sig { returns(String) }
      def self.feature_flag_hub_url
        stamp = ENV["KUBE_CLUSTER_STAMP"]

        raise Errors::ValidationError, "KUBE_CLUSTER_STAMP environment variable is not set" if stamp.nil?

        return "http://localhost:8090/twirp" if stamp == "development"

        # TODO: Add option to return the istio/cluster.local URL
        # return fmt.Sprintf("http://feature-flag-hub.feature-flag-hub-%s.svc.cluster.local:8080", stamp)

        # dotcom has a different url format
        return "https://feature-flag-hub-dotcom.service.iad.github.net" if stamp == "dotcom"

        # proxima stamps
        "https://feature-flag-hub-#{stamp}.service.#{stamp}.github.net"
      end
      private_class_method :feature_flag_hub_url

      sig { params(client: FFDV1::ChecksClient).void }
      def initialize(client)
        @client = client
      end

      sig { params(response: T::Hash[Symbol, T.untyped]).returns(FeatureFlag) }
      def convert_feature_flag_response(response)
        state = FeatureManagement::FeatureFlags::Data::V1::FeatureFlagState.resolve(response[:state])
        feature_flag = FeatureFlag.new
        feature_flag.name = response[:name]
        feature_flag.boolean_gate = state == FeatureManagement::FeatureFlags::Data::V1::FeatureFlagState::SHIPPED
        feature_flag.percentage_of_actors = response[:percentage_of_actors]
        feature_flag.percentage_of_calls = response[:percentage_of_calls]
        feature_flag.segments = response[:segments]
        feature_flag.custom_gates = response[:custom_gates]
        feature_flag.default_segment = response[:default_segment]
        feature_flag.is_default_segment_embedded = response[:is_default_segment_embedded]
        feature_flag.actors = HashActorCollection.new(response[:embedded_actors]&.map { |actor| [actor, true] }.to_h)

        feature_flag.segments << feature_flag.default_segment unless feature_flag.is_default_segment_embedded

        feature_flag
      end

      sig { params(response: T::Hash[Symbol, T.untyped]).returns(Segment) }
      def convert_segment_response(response)
        segment = Segment.new
        segment.name = response[:name]
        segment.actors = HashActorCollection.new(response[:actors]&.map { |actor| [actor, true] }.to_h)
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
    end
  end
end
