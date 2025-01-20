# frozen_string_literal: true

module Authnd
  Error              = Class.new(StandardError)
  DecorationError    = Class.new(Error)

  module Proto
    class Error < StandardError
      attr_reader :twirp_error

      def initialize(message: nil, twirp_error: nil)
        @twirp_error = twirp_error
        msg =
          if message.nil? && twirp_error.nil?
            "an error occurred communicating with authnd"
          else
            [message, twirp_error&.code, twirp_error&.msg].compact.join(": ")
          end

        super(msg)
      end
    end
  end
end
