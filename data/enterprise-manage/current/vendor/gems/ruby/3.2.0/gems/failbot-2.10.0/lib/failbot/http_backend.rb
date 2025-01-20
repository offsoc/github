module Failbot
  class HTTPBackend
    def initialize(url, connect_timeout = nil, timeout_seconds = nil)
      if url.to_s.empty?
        raise ArgumentError, "FAILBOT_HAYSTACK_URL setting required."
      end

      @haystack = Failbot::Haystack.new(url, connect_timeout, timeout_seconds)
    end

    def report(data)
      @haystack.send_data(data)
    end

    def reports
      []
    end

    def ping
      @haystack.ping
    end

    def connect_timeout
      @haystack.connect_timeout
    end

    def connect_timeout=(timeout)
      @haystack.connect_timeout = timeout
    end

    def rw_timeout
      @haystack.rw_timeout
    end

    def rw_timeout=(timeout)
      @haystack.rw_timeout = timeout
    end
  end
end
