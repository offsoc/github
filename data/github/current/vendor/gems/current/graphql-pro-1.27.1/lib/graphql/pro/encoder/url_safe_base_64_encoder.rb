# frozen_string_literal: true
module GraphQL
  module Pro
    class Encoder
      module UrlSafeBase64Encoder
        def self.encode(str)
          Base64.urlsafe_encode64(str)
        end

        def self.decode(str)
          Base64.urlsafe_decode64(str)
        end
      end
    end
  end
end
