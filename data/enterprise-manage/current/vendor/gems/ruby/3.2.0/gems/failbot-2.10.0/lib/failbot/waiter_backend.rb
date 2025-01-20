module Failbot
  class WaiterBackend
    # This backend waits a configured amount of time before returning.  This is
    # intended be used to test timeouts.  Delay is the number of seconds to wait.

    attr_reader :reports
    def initialize(delay = 5)
      @delay = delay
      @reports = []
    end

    def report(data)
      @reports << data
      sleep(@delay)
    end

    def ping
      # nop
    end
  end
end
