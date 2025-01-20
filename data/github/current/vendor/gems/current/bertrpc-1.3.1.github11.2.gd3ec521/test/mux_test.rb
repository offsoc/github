require 'test_helper'

class MuxTest < BERTRPC::Spec
  context "A MuxHandler" do
    setup do
      @port = 9941
      @host = "127.0.0.1"
      @mux_handler = BERTRPC::MuxHandler.new
      @clients = (1..3).map do |i|
        svc = BERTRPC::Service.new(@host, @port+i)
        svc.call.gitrpc
      end
    end

    should "be creatable" do
      assert @mux_handler.is_a?(BERTRPC::MuxHandler)
    end

    should "set clients' mux_handler fields" do
      @clients.each do |client|
        client.expects(:mux_handler=).with(@mux_handler).once
        @mux_handler.queue(client)
      end
    end

    should "run an empty list and produce no results" do
      @mux_handler.run(nil, nil)
    end

    should "queue and run operations" do
      @clients.each do |client|
        cs = @mux_handler.queue(client)
        set_callbacks(cs, "foo", nil)
        client.ping
      end
      run_and_check_helper
      check_callbacks(3, 0)
    end

    should "queue and run operations with user error" do
      @clients.each do |client|
        cs = @mux_handler.queue(client)
        set_callbacks(cs, "foo", [BERTRPC::UserError, BERTRPC::RemoteError])
        client.ping
      end
      run_and_check_helper(:response => [:error, [:user, 0, "RuntimeError", "Boom!", []]])
      check_callbacks(0, 3)
    end

    # Call #queue three times, then call the operations.
    should "avoid stateful, implicit connections" do
      @clients.each do |client|
        @mux_handler.queue(client)
      end
      @clients.each do |client|
        client.ping
      end
      run_and_check_helper
    end

    should "refuse to be reused" do
      @clients.each do |client|
        @mux_handler.queue(client)
        client.ping
      end
      run_and_check_helper
      assert_raises(RuntimeError) do
        @clients.each do |client|
          @mux_handler.queue(client)
          client.ping
        end
      end
    end

    should "deal gracefully with connection refused" do
      @clients.each do |client|
        cs = @mux_handler.queue(client)
        set_callbacks(cs, nil, [BERTRPC::ConnectionError, Errno::ECONNREFUSED])
        client.ping
      end

      before = Time.now
      @mux_handler.run(nil, nil)
      after = Time.now
      check_callbacks(0, 3)
      assert (after-before) < 0.5, "Connection refused took too long: #{after-before}sec"
    end

    should "deal gracefully with connection timeout" do
      clients = (1..3).map do |i|
        svc = BERTRPC::Service.new("1.1.1.1", 1110+i)
        svc.call.gitrpc
      end
      clients.each do |client|
        cs = @mux_handler.queue(client)
        set_callbacks(cs, nil, [BERTRPC::ConnectionError, BERTRPC::ConnectionError])
        client.ping
      end
      before = Time.now
      @mux_handler.run(3, 1)
      after = Time.now
      check_callbacks(0, 3)
      assert (after-before) > 0.9, "Connect timeout was too fast: #{after-before}sec"
      assert (after-before) < 1.5, "Connect timeout took too long: #{after-before}sec"
    end

    should "deal gracefully with a single connection timeout" do
      clients = [ BERTRPC::Service.new("1.1.1.1", 1111).call.gitrpc ]
      clients += @clients.take(2)
      clients.each do |client|
        cs = @mux_handler.queue(client)
        set_callbacks(cs, "foo", [BERTRPC::ConnectionError, BERTRPC::ConnectionError])
        client.ping
      end
      before = Time.now
      @mux_handler.run(3, 1)
      after = Time.now
      check_callbacks(0, 3)
      assert (after-before) > 0.9, "Connect timeout was too fast: #{after-before}sec"
      assert (after-before) < 1.5, "Connect timeout took too long: #{after-before}sec"
    end

    should "complain if an object isn't queued first" do
      @clients.each do |client|
        client.mux_handler = @mux_handler
        assert_raises(RuntimeError) do
          client.ping
        end
      end
    end

    should "complain if queue is called twice" do
      @clients.each do |client|
        @mux_handler.queue(client)
      end
      @clients.each do |client|
        assert_raises(RuntimeError) do
          @mux_handler.queue(client)
        end
      end
    end

    should "return the right error for early eof" do
      begin
        port = @port+10
        pid = fork do
          server = TCPServer.new(port)
          while true
            client = server.accept
            client.close  # hang up immediately
          end
        end

        sleep(0.7)  # let the child do the accept
        client = BERTRPC::Service.new(@host, port).call.getrpc
        cs = @mux_handler.queue(client)
        set_callbacks(cs, nil, [BERTRPC::ProtocolError, BERTRPC::ProtocolError])
        client.ping

        before = Time.now
        @mux_handler.run(3, 1)
        after = Time.now
        check_callbacks(0, 1)
        assert (after-before) < 0.5, "Connect timeout took too long: #{after-before}sec"

      ensure
        Process.kill('TERM', pid)
        Process.wait(pid)
      end
    end
  end

private
  def run_and_check_helper(options = {})
    sockstub = SocketStub.new(options)
    Socket.stubs(:new).returns(sockstub)

    @mux_handler.run(nil, nil)

    assert_equal @clients.length, sockstub.writes.length
    (1..3).each do |i|
      assert_equal([@port+i, @host], sockstub.writes[i-1][0])
    end
  end

  def set_callbacks(cs, ok_result, err_classes)
    @ok_count = @err_count = 0
    cs.on_error do |err|
      @err_count += 1
      if err_classes
        assert err.is_a?(err_classes[0]), "err is a #{err.class}, expected #{err_classes[0]}"
        assert err.original_exception.is_a?(err_classes[1]), "err.original_exception is a #{err.original_exception.class}, expected #{err_classes[1]}"
      end
    end
    cs.on_complete do |result|
      @ok_count += 1
      assert_equal ok_result, result
    end
  end

  def check_callbacks(expect_ok, expect_err)
    assert_equal expect_ok, @ok_count
    assert_equal expect_err, @err_count
  end
end

class SocketStub
  attr_reader :writes
  def initialize(options = {})
    response = options.fetch(:response, [:reply, [:ok, "foo"]])
    @writes = []
    @read_data = BERT.encode(response)
  end

  def connect_nonblock(dest)
    @dest = Socket.unpack_sockaddr_in(dest)
  end

  def write_nonblock(data)
    @writes << [ @dest, data.length ]
    data.length
  end

  def read_nonblock(length)
    case length
      when 4
        [ @read_data.bytesize ].pack("N")
      when @read_data.bytesize
        @read_data
    end
  end

  def method_missing(cmd, *args)
    #p cmd, args
  end
end
