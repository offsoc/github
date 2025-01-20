# frozen_string_literal: true
module GraphQL
  module Pro
    class Encoder
      module DecodeFailed
        def self.method_missing(method_name, *args, &block)
          raise("A GraphQL::Pro::Encoder failed to decode a cipher, can't do anything with the result")
        end
      end
    end
  end
end
