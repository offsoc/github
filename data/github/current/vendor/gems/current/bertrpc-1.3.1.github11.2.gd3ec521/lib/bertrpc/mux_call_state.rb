# frozen_string_literal: true

# This class, BERTRPC::MuxHandler::CallState, contains the state
# associated with a single operation, several of which are expected to
# proceed in parallel.
#
# The state includes a host:port to connect to, bytes to be written,
# and any bytes of the response read so far. There's a state machine
# that walks through :start -> :connecting -> :writing ->
# :reading_header -> :reading_data -> :complete, or switches to
# :failed on failure.
#
# The #run call advances the state machine. The caller should call
# #run once in any case to get the connection started. Thereafter, it
# should read [read_fd, write_fd] from #select_fds to see which fds
# need to be IO.selected on, and call #run again whenever one of those
# fds is ready for read/write. read_fd or write_fd are nil if the
# state doesn't want to read or write, respectively. When the state
# machine is done (either :complete or :failed), #select_fds returns
# [nil, nil].

module BERTRPC
  class MuxHandler
    class CallState
      attr_accessor :error
      attr_reader :host, :port, :select_fds, :result

      include BERTRPC::Encodes

      def initialize
        @state = :start
        @select_fds = [nil, nil]
        @header_bytes = +""
        @read_data = +""
        @write_data = +""
        @write_ofs = 0
        @error = nil
        @completion_block = nil
      end

      def to_s
        "<state=#{@state.inspect} error=#{@error.inspect} result=#{@result.inspect}>"
      end

      def on_complete(&block)
        @completion_block = block
        self
      end

      def on_error(&block)
        @error_block = block
        self
      end

      def call_callbacks
        if @error
          @error_block.call(@error) if @error_block
        elsif @result_is_set
          @completion_block.call(@result) if @completion_block
        end
      ensure
        @error = @result = @result_is_set = nil
      end

      def result= (val)
        @result = val
        @result_is_set = true
      end

      def connect(host, port)
        @host, @port = host, port
      end

      def write(data)
        @write_data << data
      end

      def connected?
        @state != :start && @state != :connecting
      end

      def finished?
        @state == :complete
      end

      def read_data
        raise if !finished?
        @read_data
      end

      def read_result
        decode_bert_response(read_data)
      end

      def cleanup
        if @sock
          @sock.close
          @sock = nil
        end
      end

      # Execute the next step in the connection's state machine.
      # States are:
      #   :start = nothing has been done with this socket yet
      #   :connecting = SYN sent, select-on-write to get result
      #   :writing = connection completed, 0<=x<N bytes written so far
      #   :reading_header = writing complete, 0<=x<4 bytes read
      #   :reading_data = header-read complete, 0<=x<N data bytes read
      #   :complete = all reads and writes completed
      #   :failed = call has failed
      def run
        # If one stage can happen without any blocking, then we can
        # move on to the next stage immediately. Small writes in
        # particular generally do not block.
        while run_one
        end
      end

      private

      # Advance the state machine if possible. Return a truthy value
      # if the next state should run immediately.
      def run_one
        case @state
        when :start
          do_start
        when :connecting
          do_connecting
        when :writing
          do_writing
        when :reading_header
          do_reading_header
        when :reading_data
          do_reading_data
        when :complete, :failed
          nil
        else
          raise "Invalid state #{@state.inspect}"
        end
      end

      def do_start
        # Map @host to an address synchronously.  We assume DNS is fast,
        # nearby, and usually cached.  In any event, async DNS is kind
        # of a pain.
        @addr = Socket.getaddrinfo(@host, nil, Socket::AF_INET)

        @sock = Socket.new(Socket.const_get(@addr[0][0]), Socket::SOCK_STREAM, 0)
        @sock.setsockopt Socket::IPPROTO_TCP, Socket::TCP_NODELAY, 1
        begin
          @sock.connect_nonblock(Socket.pack_sockaddr_in(@port, @addr[0][3]))
        rescue Errno::EINPROGRESS
          @state = :connecting
          @select_fds = [nil, @sock]
          return false
        end

        @state = :writing
        @select_fds = [nil, @sock]
        true
      end

      def do_connecting
        begin
          @sock.connect_nonblock(Socket.pack_sockaddr_in(@port, @addr[0][3]))
        rescue Errno::EISCONN
          # This is fine.
        rescue Errno::EINPROGRESS, Errno::EALREADY, Errno::EINTR
          return false
        end
        @state = :writing
        @select_fds = [nil, @sock]
        true
      end

      def do_writing
        begin
          len = @sock.write_nonblock(@write_data.byteslice(@write_ofs..-1))
        rescue IO::WaitWritable
          return false
        end
        @write_ofs += len
        if @write_ofs == @write_data.bytesize
          @state = :reading_header
          @select_fds = [@sock, nil]
          return true
        end
        false
      end

      def do_reading_header
        begin
          dat = @sock.read_nonblock(4 - @header_bytes.length)
        rescue EOFError, Errno::ECONNRESET
          @state = :failed
          @select_fds = [nil, nil]
          cleanup
          raise BERTRPC::ProtocolError.new(BERTRPC::ProtocolError::NO_HEADER)
        rescue IO::WaitReadable
          return false
        end

        if dat.empty?  # eof
          @state = :failed
          @select_fds = [nil, nil]
          cleanup
          raise BERTRPC::ProtocolError.new(BERTRPC::ProtocolError::NO_HEADER)
        end

        @header_bytes << dat
        if @header_bytes.length == 4
          @data_length = @header_bytes.unpack("N").first
          @state = :reading_data
          @select_fds = [@sock, nil]
          return true
        end
        false
      end

      def do_reading_data
        begin
          dat = @sock.read_nonblock(@data_length - @read_data.length)
        rescue IO::WaitReadable
          return false
        end

        if dat.empty?  # eof
          @state = :failed
          @select_fds = [nil, nil]
          cleanup
          raise BERTRPC::ProtocolError.new(BERTRPC::ProtocolError::NO_DATA)
        end

        @read_data << dat
        if @read_data.length == @data_length
          @state = :complete
          @select_fds = [nil, nil]
          cleanup
        end
        return false
      end
    end  # CallState class
  end
end
