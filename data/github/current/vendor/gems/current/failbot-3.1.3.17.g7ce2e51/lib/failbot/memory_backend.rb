module Failbot
  class MemoryBackend
    def initialize
      @reports = []
      @fail    = false
    end

    attr_accessor :reports

    def fail!
      @fail = true
    end

    def report(data)
      @reports << data
      fail if @fail
    end

    def ping
      # nop
    end
  end
end
