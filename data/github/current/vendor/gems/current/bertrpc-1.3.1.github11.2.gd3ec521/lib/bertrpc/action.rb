module BERTRPC
  class Action
    include Encodes

    def initialize(svc, req, mod, fun, args)
      @svc = svc
      @req = req
      @mod = mod
      @fun = fun
      @args = args
    end

    def execute(mod_obj=nil, mux_handler=nil)
      bert_request = encode_ruby_request(t[@req.kind, @mod, @fun, @args])
      if mux_handler
        mux_transaction(bert_request, mod_obj, mux_handler)
      else
        bert_response = transaction(bert_request)
        decode_bert_response(bert_response)
      end
    end

    #private

    def write(sock, bert)
      sock.write([bert.bytesize].pack("N"))
      sock.write(bert)
    end

    def read(sock, len)
      buff = sock.read(len)

      if buff.nil? || buff.length < len
        raise Errno::ECONNRESET
      end

      buff
    end

    def mux_transaction(bert_request, mod_obj, mux_handler)
      mux_handler.connect(mod_obj, @svc.host, @svc.port)
      mux_handler.write(mod_obj, [bert_request.bytesize].pack("N"))
      mux_handler.write(mod_obj, bert_request)
    end

    def transaction(bert_request)
      timeout = @svc.timeout && Float(@svc.timeout)
      sock = connect_to(@svc.host, @svc.port, @svc.connect_timeout)
      if @req.options
        if @req.options[:cache] && @req.options[:cache][0] == :validation
          token = @req.options[:cache][1]
          info_bert = encode_ruby_request([:info, :cache, [:validation, token]])
          write(sock, info_bert)
        end
      end

      write(sock, bert_request)

      bert_response = Timeout::timeout(timeout) do
        lenheader = read(sock, 4)
        raise ProtocolError.new(ProtocolError::NO_HEADER) unless lenheader
        len = lenheader.unpack('N').first
        read(sock, len)
      end

      raise ProtocolError.new(ProtocolError::NO_DATA) unless bert_response
      bert_response
    rescue Errno::ECONNREFUSED, Errno::EHOSTUNREACH
      raise ConnectionError.new(@svc.host, @svc.port)
    rescue Errno::EAGAIN, Timeout::Error
      raise ReadTimeoutError.new(@svc.host, @svc.port, @svc.timeout)
    rescue Errno::ECONNRESET
      raise ReadError.new(@svc.host, @svc.port)
    ensure
      sock.close if sock
    end

    # Creates a socket object which does speedy, non-blocking reads
    # and can perform reliable read timeouts.
    #
    # Raises Timeout::Error on timeout.
    #
    #   +host+ String address of the target TCP server
    #   +port+ Integer port of the target TCP server
    #   +timeout+ Optional Integer (in seconds) of the read timeout
    def connect_to(host, port, timeout = nil)
      timeout = timeout && Float(timeout)
      addr = Socket.getaddrinfo(host, nil, Socket::AF_INET)
      sock = Socket.new(Socket.const_get(addr[0][0]), Socket::SOCK_STREAM, 0)
      sock.setsockopt Socket::IPPROTO_TCP, Socket::TCP_NODELAY, 1

      if timeout
        secs = Integer(timeout)
        usecs = Integer((timeout - secs) * 1_000_000)
        optval = [secs, usecs].pack("l_2")
        sock.setsockopt Socket::SOL_SOCKET, Socket::SO_RCVTIMEO, optval
        sock.setsockopt Socket::SOL_SOCKET, Socket::SO_SNDTIMEO, optval

        begin
          sock.connect_nonblock(Socket.pack_sockaddr_in(port, addr[0][3]))
        rescue Errno::EINPROGRESS
          result = IO.select(nil, [sock], nil, timeout)
          if result.nil?
            raise ConnectionError.new(@svc.host, @svc.port)
          end
          begin
            sock.connect_nonblock(Socket.pack_sockaddr_in(port, addr[0][3]))
          rescue Errno::EISCONN
          end
        end
      else
        sock.connect(Socket.pack_sockaddr_in(port, addr[0][3]))
      end

      sock
    end
  end
end
