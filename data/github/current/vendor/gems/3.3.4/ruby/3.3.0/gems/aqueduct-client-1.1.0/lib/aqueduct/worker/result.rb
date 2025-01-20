module Aqueduct
  module Worker
    class Result
      def self.ok(value, backend_name: "", backoff_seconds: nil)
        Result.new(value: value, error: nil, backend_name: backend_name, backoff_seconds: backoff_seconds)
      end

      def self.empty(backend_name: "", backoff_seconds: nil)
        Result.new(value: nil, error: nil, backend_name: backend_name, backoff_seconds: backoff_seconds)
      end

      def self.error(error)
        Result.new(value: nil, error: error)
      end

      def self.invalid_payload(value, backend_name: "")
        Result.new(value: value, error: nil, invalid_payload: true, backend_name: backend_name)
      end

      attr_reader :value, :error, :backend_name, :backoff_seconds

      def initialize(value:, error:, invalid_payload: false, backend_name: "", backoff_seconds: nil)
        @value = value
        @error = error
        @invalid_payload = invalid_payload
        @backend_name = backend_name
        @backoff_seconds = backoff_seconds
      end

      def ok?
        !error? && !invalid_payload?
      end

      def present?
        !!value
      end

      def error?
        !!error
      end

      def invalid_payload?
        present? && @invalid_payload
      end

      def backoff?
        backoff_seconds.to_i > 0
      end

      def has_backend_name?
        @backend_name && !@backend_name.empty?
      end
    end
  end
end
