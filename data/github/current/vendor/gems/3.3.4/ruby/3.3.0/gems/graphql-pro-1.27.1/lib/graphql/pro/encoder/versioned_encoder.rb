# frozen_string_literal: true
module GraphQL
  module Pro
    class Encoder
      # Suitable for {Schema#encoder}
      # @api private
      class VersionedEncoder
        def initialize(versions)
          @versions = versions
          @first_version = versions.first
        end

        def encode(string_data, nonce: false)
          @first_version.encode(string_data, nonce: nonce)
        end

        def decode(string_data, nonce: false)
          versioned_decode(string_data, nonce: nonce)[0]
        end

        # @return [Array(String, Encoder)] The decoded string and the encoder used to decode it
        # @return [Array(DECODE_FAILED, nil)] If no encoder could decode `string_data`
        def versioned_decode(string_data, nonce: false)
          @versions.each do |version|
            res = version.decode(string_data, nonce: nonce)
            if res == DECODE_FAILED
              next
            else
              return res, version
            end
          end

          [DECODE_FAILED, nil]
        end
      end
    end
  end
end
