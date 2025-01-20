# frozen_string_literal: true

module WindbeamApi
  module Errors
    class HMACNotConfiguredError < StandardError
      def message
        "HMAC is not configured correctly, please set the HMAC_KEY environment variable"
      end
    end

    class CommunicationError < StandardError; end
  end
end
