# frozen_string_literal: true
module GraphQL
  module Pro
    class Encoder
      # @api private
      module Base64Encoder
        module_function

        # This also trims trailing `=` & newlines
        def encode(bytes)
          str = Base64.encode64(bytes)
          str.sub!(/=*\n?$/, "".freeze)
          str
        end

        def decode(string)
          Base64.decode64(string)
        end
      end
    end
  end
end
