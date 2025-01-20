# frozen_string_literal: true
require "openssl"

module GraphQL
  module Pro
    class Encoder
      # @api private
      class OpenSSLCipher
        def initialize(cipher_name)
          # Make sure the name is valid:
          OpenSSL::Cipher.new(cipher_name)

          @cipher_name = cipher_name
        end

        # @return [String]
        def encrypt(encoder, data, nonce)
          cipher = OpenSSL::Cipher.new(@cipher_name)
          cipher.encrypt
          cipher.key = encoder.key

          if nonce
            iv = cipher.random_iv
          else
            iv = "\0" * cipher.iv_len
          end
          cipher.iv = iv

          if cipher.authenticated?
            cipher.auth_data = encoder.tag
          else
            data = encoder.tag + data
          end

          payload = "#{cipher.update(data)}#{cipher.final}"
          "#{nonce ? iv : ""}#{payload}#{cipher.authenticated? ? cipher.auth_tag(16) : ""}"
        end

        # @return [String]
        def decrypt(encoder, data, nonce)
          cipher = OpenSSL::Cipher.new(@cipher_name)
          cipher.decrypt
          cipher.key = encoder.key

          data_end = -1

          if nonce
            iv = data.slice!(0, cipher.iv_len)

            if iv.nil? || iv.length < cipher.iv_len
              return Encoder::DECODE_FAILED
            else
              cipher.iv = iv
            end
          else
            cipher.iv = "\0" * cipher.iv_len
          end

          if cipher.authenticated?
            cipher.auth_tag = data.byteslice(-16..-1)
            data_end = -17
            cipher.auth_data = encoder.tag
          end

          if data.length == (data_end.abs - 1)
            # If the data is the same length as the auth tag,
            # then it didn't originate from this encoder.
            return DECODE_FAILED
          end
          data = data.byteslice(0..data_end)

          result = cipher.update(data) + cipher.final

          if !cipher.authenticated? && !encoder.tag.empty?
            tag = result.slice!(0, encoder.tag.length)
            if tag != encoder.tag
              return DECODE_FAILED
            end
          end

          result
        rescue OpenSSL::Cipher::CipherError, TypeError
          # TypeError can happen if the input is too short (byteslice fails)
          Encoder::DECODE_FAILED
        end
      end
    end
  end
end
