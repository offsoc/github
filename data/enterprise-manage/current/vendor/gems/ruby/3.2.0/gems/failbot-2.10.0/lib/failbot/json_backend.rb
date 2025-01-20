require 'json'

module Failbot
  class JSONBackend
    def initialize(host, port)
      if host.to_s.empty?
        raise ArgumentError, "FAILBOT_BACKEND_JSON_HOST setting required."
      end
      if port.to_s.empty?
        raise ArgumentError, "FAILBOT_BACKEND_JSON_PORT setting required."
      end

      @host = host
      @port = port
    end

    def report(data)
      payload = data.to_json

      socket do |s|
        s.send(payload, 0)
        nil
      end
    end

    def reports
      raise NotImplementedError
    end

    def ping
       response = socket do |s|
        s.send("PING", 0)
        s.close_write
        s.read
      end

      raise StandardError, "failbotd didn't respond to PING, #{response} returned" unless response.start_with?("PONG")
    end

    private

    # Connect to failbotd and yield the connection.
    #
    # Messages are framed by closing the write end of the socket, both ends of
    # the socket are closed upon return from the block.
    #
    # block :: TCPSocket -> AnyType
    #          A block invoked invoked with an open socket to failbotd. The
    #          return value is returned from this method.
    #
    # Returns the return value of the block.
    def socket(&block)
      socket = TCPSocket.new @host, @port
      response = yield socket
      response
    ensure
      socket.close if socket
    end
  end
end
