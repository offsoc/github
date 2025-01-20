# frozen_string_literal: true

require_relative './errors'

module IssuesGraph

  # PORO envelope for issues-graph client Twirp responses
  class Result
    # creates a result object and set its status based on the response provided
    #
    # response - ::Twirp::Response
    def self.response(response)
      new(response: response)
    end

    # creates a success result object with the defined data, mainly used for tests
    #
    # data - protobuf response instance
    def self.success(data)
      new(data: data)
    end

    # creates a result object with an :error status
    #
    # error          - ::Twirp::Error | ClientError | StandardError
    # original_error - optional error intercepted by the client
    def self.error(error, original_error = nil)
      new(error: error, original_error: original_error)
    end

    attr_reader :error, :data, :status, :original_error

    # response       - ::Twirp::Response instance. If the response has an error, it'll be used
    #                  to set the @error instance variable of the result object
    # error          - ::Twirp::Error instance
    # original_error - The original error that was rescued and wrapped into the ::Twirp::Error
    # data           - the protobuf data structure to be wrapped by the result object
    def initialize(response: nil, error: nil, original_error: nil, data: nil)
      raise ::IssuesGraph::Errors::ArgumentError.new("response, error, and data cannot all be nil") if response.nil? && error.nil? && data.nil?

      @status = !data.nil? || (error.nil? && response.error.nil?) ? :success : :error

      @response = response
      @data = data || response&.data
      @error = error || response&.error
      @original_error = original_error || @error

      wrap_error_for_consumer
    end

    def success?
      @status == :success
    end

    def error?
      @status != :success
    end

    def error_message
      @error&.message || @original_error&.message
    end

    def error_code
      @error&.code
    end

    def to_h
      hash = {
        status: @status,
        data: @data,
      }
      hash[:error_message] = error_message unless error_message.nil?
      hash[:error_code] = error_code unless error_code.nil?

      hash
    end

    # ensure that if the @error is present, it will be normalized into a
    # ClientError interface
    def wrap_error_for_consumer
      return if @error.nil? || @error.is_a?(::IssuesGraph::Errors::ClientError)

      @error = ::IssuesGraph::Errors::ClientError.new(inner_error: @error)
    end
  end
end
