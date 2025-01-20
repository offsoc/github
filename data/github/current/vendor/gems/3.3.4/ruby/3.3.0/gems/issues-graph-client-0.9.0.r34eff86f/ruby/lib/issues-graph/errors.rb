# typed: true
# frozen_string_literal: true

module IssuesGraph
  module Errors
    class ArgumentError < ::ArgumentError; end

    # Client error wrapper to normalize the Twirp::Error interface for consumers,
    # allowing the error to be used with Failbot, since it expects that an error
    # will have the @message instance variable instead of @msg that the
    # Twirp::Error class implements
    class ClientError < ::StandardError
      attr_reader :inner_error

      # msg         - main error message. If not provided, the initializer will
      #               try to use the error message of the inner_error, if available.
      # inner_error - error being wrapped by this class. If the inner_error is a
      #               Twirp::Error, this class will expose its code and use its
      #               msg instance variable to fill the @message of the
      #               StandardError (parent class)
      def initialize(msg = nil, inner_error: nil)
        super(msg)

        @inner_error = inner_error
        return if inner_error.nil? || !msg.nil?

        # normalize inner error message
        @message = wraps_twirp_error? ? inner_error.msg : inner_error.message
      end

      def code
        @inner_error.code if wraps_twirp_error?
      end

      def to_h
        hash = {
          message: @message,
        }
        hash[:code] = code unless code.nil?
        hash[:meta] = @inner_error.meta if wraps_twirp_error? && !@inner_error.meta.empty?

        hash
      end

      private def wraps_twirp_error?
        @inner_error.is_a?(::Twirp::Error)
      end
    end
  end
end
