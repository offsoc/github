# frozen_string_literal: true
require "graphql/pro/encoder/decode_failed"
require "graphql/pro/encoder/null_cipher"
require "graphql/pro/encoder/openssl_cipher"
require "graphql/pro/encoder/base_64_encoder"
require "graphql/pro/encoder/url_safe_base_64_encoder"
require "graphql/pro/encoder/versioned_encoder"

module GraphQL
  module Pro
    # Encrypt a verision encoder and some stringified data into an opaque encoder.
    #
    # @example defining an encrypted encoder with a version
    #   EncV1 = GraphQL::Pro::Encoder.define do
    #     key("79dd3081ce51c3079077792d3d87d12d")
    #     tag("v1")
    #   end
    class Encoder
      DEFAULT_CIPHER = OpenSSLCipher.new("aes-128-gcm")
      DECODE_FAILED = DecodeFailed

      if defined?(GraphQL::Define)
        include GraphQL::Define::InstanceDefinable
        if defined?(GraphQL::Define::InstanceDefinable::DeprecatedDefine)
          extend Define::InstanceDefinable::DeprecatedDefine
        end
        defn_method = respond_to?(:deprecated_accepts_definitions) ? :deprecated_accepts_definitions : :accepts_definitions
        public_send defn_method, :tag, :key, :cipher, :encoder
        ensure_defined :tag, :key, :cipher
      end

      attr_accessor :tag, :key, :cipher, :encoder

      def self.versioned(*versions)
        VersionedEncoder.new(versions)
      end

      def initialize
        @tag = ""
        self.cipher = DEFAULT_CIPHER
        @encoder = Base64Encoder
      end

      def encode(string_data, nonce: false)
        ensure_defined
        raw_bytes = @cipher.encrypt(self, string_data, nonce)
        @encoder.encode(raw_bytes)
      end

      def decode(opaque_string, nonce: false)
        ensure_defined
        raw_bytes = @encoder.decode(opaque_string)
        @cipher.decrypt(self, raw_bytes, nonce)
      end

      def cipher=(new_cipher)
        @cipher = case new_cipher
        when nil
          NullCipher
        when String
          OpenSSLCipher.new(new_cipher)
        else
          new_cipher
        end
      end

      class << self
        def encoder(new_encoder = :read)
          if new_encoder == :read
            @encoder || Base64Encoder
          else
            @encoder = new_encoder
          end
        end

        def key(new_key = :read)
          if new_key == :read
            @key || raise(ArgumentError, "A `key(...)` is required to use an encoder -- configure it for #{self}")
          else
            @key = new_key
          end
        end

        def tag(new_tag = :read)
          if new_tag == :read
            @tag || ""
          else
            @tag = new_tag
          end
        end

        def encode(string_data, nonce: false)
          raw_bytes = cipher.encrypt(self, string_data, nonce)
          encoder.encode(raw_bytes)
        end

        def decode(opaque_string, nonce: false)
          raw_bytes = encoder.decode(opaque_string)
          cipher.decrypt(self, raw_bytes, nonce)
        end

        def cipher(new_cipher = :read)
          case new_cipher
          when :read
            @cipher || DEFAULT_CIPHER
          when nil
            @cipher = NullCipher
          when String
            @cipher = OpenSSLCipher.new(new_cipher)
          else
            @cipher = new_cipher
          end
        end
      end
    end
  end
end
