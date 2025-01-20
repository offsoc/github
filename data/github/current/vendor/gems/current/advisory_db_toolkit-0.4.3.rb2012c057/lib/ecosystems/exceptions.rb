# frozen_string_literal: true

module AdvisoryDBToolkit::Ecosystems
  class Exceptions
    class ApiError < StandardError
      attr_accessor :response

      def initialize(message = nil, response: nil)
        super(message)
        @response = response
      end

      def status
        response&.status
      end
    end
  end
end
