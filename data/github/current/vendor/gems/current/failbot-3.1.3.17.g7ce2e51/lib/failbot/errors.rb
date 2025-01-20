module Failbot
  class SetupError < StandardError
    def initialize
      super("Failbot has already been set up. Failbot.setup can only be called once to configure Failbot.")
    end
  end

  class MissingSetupError < StandardError
    def initialize
      super("Failbot is not setup. Please call Failbot.setup to configure Failbot in order to report exceptions.")
    end
  end

  class ReportingError < StandardError
    def initialize
      super("Failbot encountered an exception reporting the provided error")
    end
  end

  class CircuitBreakerOpenError < StandardError
    def initialize
      super("Failbot won't send the exception to Failbotg: circuit breaker open")
    end
  end
end
