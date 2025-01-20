# frozen_string_literal: true
module GraphQL
  module Pro
    class Encoder
      # @api private
      module NullCipher
        module_function

        def encrypt(encoder, data, nonce)
          encoder.tag + data
        end

        def decrypt(encoder, data, nonce)
          data.start_with?(encoder.tag) ? data.sub(encoder.tag, "") : DECODE_FAILED
        end
      end
    end
  end
end
