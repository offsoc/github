# This class, BERTRPC::MuxHandler, encapsulates the state of several
# parallel BERTRPC calls.  Queue things up, then let them run, then check
# their results and errors.
#
# For example:
#   handler = BERTRPC::MuxHandler.new
#
#   objects.each do |rpc|
#     call_state = handler.queue(rpc)
#     call_state.on_complete { |result| puts result }
#     call_state.on_error    { |exception| raise exception }
#     rpc.send_message(path, options, message, args)
#   end
#   handler.run(timeout, connect_timeout)
#
# objects is an array of BERTRPC::Mod objects.
#
# Operations and their results/errors are keyed off the Mod objects.  So
# you can't queue more than one operation per object.

require 'bertrpc/mux_call_state'

module BERTRPC
  class MuxHandler
    def initialize
      @calls = {}
      @did_run = false
    end

    def queue(client)
      raise "do not reuse MuxHandler objects" if @did_run
      raise "queue already called for #{client.inspect}" if client.mux_handler
      client.mux_handler = self
      @calls[client] = client.respond_to?(:call_state) ? client.call_state : CallState.new
    end

    # Run all queued operations.
    # If `timeout` seconds elapse before all results are received,
    # unfinished connections are aborted.  A `timeout` value of nil lets
    # operations run indefinitely.
    # Once operations have been run, call any associated callbacks.
    def run(timeout, connect_timeout)
      @did_run = true
      run_io(timeout, connect_timeout)
      clean_up_calls
      call_callbacks(timeout)
    end

    def connect(mod, host, port)
      call = @calls[mod]
      raise "queue not called for #{mod.inspect}" unless call
      call.connect(host, port)
    end

    def write(mod, data)
      call = @calls[mod]
      raise "queue not called for #{mod.inspect}" unless call
      call.write(data)
    end

private
    # Do the I/O (connect, write, read) for each RPC, until and unless
    # timeout elapses.
    def run_io(timeout, connect_timeout)
      now = Time.now
      connect_expire = now + connect_timeout if connect_timeout
      expire = now + timeout if timeout

      # The first time through, we process all of the calls (this is
      # when they would typically connect). Subsequently, we only
      # process those that have work to do according to IO.select.
      ready_calls = @calls.values

      while true
        writers = {}
        readers = {}
        connecting = false
        @calls.each_value do |call|
          next if call.error

          if ready_calls.include?(call)
            begin
              call.run
            rescue Exception => e
              call.error = e
            end
          end

          readfd, writefd = call.select_fds
          readers[readfd] = call unless readfd.nil?
          writers[writefd] = call unless writefd.nil?
          connecting ||= !call.connected?
        end

        break if writers.empty? && readers.empty?

        remain =
          if connecting && connect_timeout
            connect_expire - Time.now
          elsif expire
            expire - Time.now
          end

        break if remain && remain <= 0

        result = IO.select(readers.keys, writers.keys, nil, remain)

        if result.nil?
          if connecting  # connect timeout
            @calls.each_value do |call|
              if !call.connected?
                call.error = ConnectionError.new(call.host, call.port)
              end
            end
            ready_calls = []
          else
            break  # non-connect timeout
          end
        else
          readfds, writefds = result
          ready_calls = readfds.map { |readfd| readers[readfd] } +
                        writefds.map { |writefd| writers[writefd] }
        end
      end
    end

    # Clean up each call -- i.e., close their sockets.
    def clean_up_calls
      @calls.each_value do |call|
        call.cleanup
      end
    end

    # Parse responses, set result and error values, and then call the
    # appropriate callbacks.
    def call_callbacks(timeout)
      @calls.each_value do |call|
        if !call.connected?
          if !call.error.is_a?(BERTRPCError)
            new_error = ConnectionError.new(call.host, call.port)
            new_error.original_exception = call.error
            call.error = new_error
          end
        elsif !call.finished?
          if !call.error.is_a?(BERTRPCError)
            new_error = ReadTimeoutError.new(call.host, call.port, timeout)
            new_error.original_exception = call.error
            call.error = new_error
          end
        else
          begin
            status, res = call.read_result
            if status == :ok
              call.result = res
            elsif status == :boom
              call.error = res
            else
              call.error = GitRPC::NetworkError.new("invalid bertrpc status: #{status.inspect}")
            end
          rescue Exception => e
            call.error = e
          end
        end
        call.call_callbacks
      end
    end
  end
end
