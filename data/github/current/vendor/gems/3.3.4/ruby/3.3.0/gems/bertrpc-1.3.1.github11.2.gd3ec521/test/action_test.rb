require 'test_helper'

class ActionTest < BERTRPC::Spec
  context "An Action" do
    setup do
      @svc = BERTRPC::Service.new('localhost', 9941)
      @req = @svc.call
    end

    should "be created with a Service, module name, fun name, and args" do
      assert BERTRPC::Action.new(@svc, @req, :mymod, :myfun, [1, 2]).is_a?(BERTRPC::Action)
    end
  end

  context "An Action instance" do
    setup do
      @svc = BERTRPC::Service.new('localhost', 9941)
      @req = @svc.call
      @enc = Enc.new
    end

    should "call with single-arity" do
      req = @enc.encode_ruby_request(t[:call, :mymod, :myfun, [1]])
      res = @enc.encode_ruby_request(t[:reply, 2])
      call = BERTRPC::Action.new(@svc, @req, :mymod, :myfun, [1])
      call.expects(:transaction).with(req).returns(res)
      assert_equal 2, call.execute
    end

    should "call with single-arity array" do
      req = @enc.encode_ruby_request(t[:call, :mymod, :myfun, [[1, 2, 3]]])
      res = @enc.encode_ruby_request(t[:reply, [4, 5, 6]])
      call = BERTRPC::Action.new(@svc, @req, :mymod, :myfun, [[1, 2, 3]])
      call.expects(:transaction).with(req).returns(res)
      assert_equal [4, 5, 6], call.execute
    end

    should "call with multi-arity" do
      req = @enc.encode_ruby_request(t[:call, :mymod, :myfun, [1, 2, 3]])
      res = @enc.encode_ruby_request(t[:reply, [4, 5, 6]])
      call = BERTRPC::Action.new(@svc, @req, :mymod, :myfun, [1, 2, 3])
      call.expects(:transaction).with(req).returns(res)
      assert_equal [4, 5, 6], call.execute
    end

    context "sync_request" do
      setup do
        @svc = BERTRPC::Service.new('localhost', 9941)
        @req = @svc.call
        @call = BERTRPC::Action.new(@svc, @req, :mymod, :myfun, [])
      end

      should "read and write BERT-Ps from the socket" do
        io = stub()
        io.expects(:write).with("\000\000\000\003")
        io.expects(:write).with("foo")
        @call.expects(:read).with(io, 4, nil).returns("\000\000\000\003")
        @call.expects(:read).with(io, 3, nil).returns("bar")
        io.expects(:close)
        @call.expects(:connect_to).returns(io)
        assert_equal "bar", @call.transaction("foo")
      end

      should "raise a ProtocolError when the length is invalid" do
        io = stub()
        io.expects(:write).with("\000\000\000\003")
        io.expects(:write).with("foo")
        io.expects(:close)
        @call.expects(:read).with(io, 4, nil).returns(nil)
        @call.expects(:connect_to).returns(io)
        begin
          @call.transaction("foo")
          fail "Should have thrown an error"
        rescue BERTRPC::ProtocolError => e
          assert_equal 0, e.code
        end
      end

      should "raise a ProtocolError when the data is invalid" do
        io = stub()
        io.expects(:write).with("\000\000\000\003")
        io.expects(:write).with("foo")
        io.expects(:close)
        @call.expects(:read).with(io, 4, nil).returns("\000\000\000\003")
        @call.expects(:read).with(io, 3, nil).returns(nil)
        @call.expects(:connect_to).returns(io)
        begin
          @call.transaction("foo")
          fail "Should have thrown an error"
        rescue BERTRPC::ProtocolError => e
          assert_equal 1, e.code
        end
      end

      should "raise a ReadTimeoutError when the connection times out" do
        io = stub()
        io.expects(:write).with("\000\000\000\003")
        io.expects(:write).with("foo")
        io.expects(:close)
        @call.expects(:read).with(io, 4, nil).raises(Errno::EAGAIN)
        @call.expects(:connect_to).returns(io)
        begin
          @call.transaction("foo")
          fail "Should have thrown an error"
        rescue BERTRPC::ReadTimeoutError => e
          assert_equal 0, e.code
          assert_equal 'localhost', e.host
          assert_equal 9941, e.port
        end
      end

      should "raise a ReadTimeoutError when the connection times out from Timeout#timeout" do

        # Fake socket class that timeouts on a large read
        socket = Class.new do
          def read(len)
            sleep(3.0) if len > 4
            "b" * len
          end
        end.new

        socket.expects(:write).with("\000\000\000\003")
        socket.expects(:write).with("foo")
        socket.expects(:close)
        @call.expects(:connect_to).returns(socket)
        @svc.stubs(:timeout).returns(1.0)

        begin
          @call.transaction("foo")
          fail "Should have thrown an error"
        rescue BERTRPC::ReadTimeoutError => e
          assert_equal 0, e.code
          assert_equal 'localhost', e.host
          assert_equal 9941, e.port
        end
      end

      should "raise a ReadError when the socket becomes unreadable" do
        io = stub()
        io.expects(:write).with("\000\000\000\003")
        io.expects(:write).with("foo")
        io.expects(:close)
        @call.expects(:read).with(io, 4, nil).raises(Errno::ECONNRESET)
        @call.expects(:connect_to).returns(io)
        begin
          @call.transaction("foo")
          fail "Should have thrown an error"
        rescue BERTRPC::ReadError => e
          assert_equal 0, e.code
          assert_equal 'localhost', e.host
          assert_equal 9941, e.port
        end
      end
    end
  end
end
