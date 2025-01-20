# frozen_string_literal: true

module GitHubTrilogyAdapter
  module ConnectionInstrumentation
    extend ActiveSupport::Concern

    # Patches methods from  activerecord/lib/active_record/connection_adapters/abstract_adapter.rb
    # to instrument connection retries.
    def reconnect!(...)
      super
    rescue => exception
      if _retryable_connection_error?(exception)
        @instrumenter.instrument("connection_retries_exhausted.active_record", error_class_name: exception.cause.class.name)
      end

      raise
    end

    prepended do
      private
        alias _retryable_connection_error? retryable_connection_error?

        def retryable_connection_error?(exception)
          super.tap do |result|
            original_exception = exception.cause || $! || exception

            if result
              @instrumenter.instrument("retry_connection.active_record", error: original_exception)
            elsif original_exception.is_a?(::Trilogy::Error)
              @instrumenter.instrument("connection_unretriable.active_record", error_class_name: original_exception.class.name)
            end
          end
        end
    end

    private

      def configure_connection
        @instrumenter.instrument("establish_connection.active_record") do
          super
        end
      end

      def connect
        @instrumenter.instrument("connect.active_record", host: @config[:host], database: @config[:database]) do
          super
        end
      end
  end
end
