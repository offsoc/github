# frozen_string_literal: true

module GitHub
  module Telemetry
    module Logs
      # Provides class and instance level logger methods
      #
      # Example:
      #
      #   class ExternalSupplier
      #     # Create class and instance logger methods
      #     include ::GitHub::Telemetry::Logs::Loggable
      #
      #     def call_supplier(amount, name)
      #       logger.debug "Calculating with amount", { amount: amount, name: name }
      #       # ...
      #     end
      #   end
      #
      module Loggable
        def self.included(base)
          base.singleton_class.class_eval do
            undef_method :logger if method_defined?(:logger)
            undef_method :logger= if method_defined?(:logger=)
          end
          base.class_eval do
            undef_method :logger if method_defined?(:logger)
            undef_method :logger= if method_defined?(:logger=)

            # Returns [SemanticLogger::Logger] class level logger
            def self.logger
              @semantic_logger ||= Logs.logger(self)
            end

            # Replace instance class level logger
            def self.logger=(logger)
              @semantic_logger = logger
            end

            # Returns [SemanticLogger::Logger] instance level logger
            def logger
              @semantic_logger ||= self.class.logger
            end

            # Replace instance level logger
            def logger=(logger)
              @semantic_logger = logger
            end
          end
        end
      end
    end
  end
end
