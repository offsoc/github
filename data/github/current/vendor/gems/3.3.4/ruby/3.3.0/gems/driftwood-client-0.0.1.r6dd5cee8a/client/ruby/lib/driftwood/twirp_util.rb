# frozen_string_literal: true

require "faraday"

module Driftwood
  module TwirpUtil
    class Error < StandardError
      attr_reader :twirp_response

      def initialize(twirp_response: nil)
        @twirp_response = twirp_response
        unless twirp_response.nil?
          super(twirp_response.error.to_json)
        end
      end
    end

    class InvalidArgumentError < Error; end

    class RateLimitedError < Error; end

    # Execute a twirp query and return the response data
    def execute_query(client:)
      response = client.public_send(client_method, request)
      if response.error.nil?
        return response.data
      else
        case String(response.error.code)
        when "resource_exhausted"
          raise RateLimitedError.new(twirp_response: response)
        when "invalid_argument"
          raise InvalidArgumentError.new(twirp_response: response)
        else
          raise Error.new(twirp_response: response)
        end
      end
    end
  end
end
