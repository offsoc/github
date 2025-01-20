# frozen_string_literal: true

module Authnd
  module Client
    module Middleware
      class BaseTest < Minitest::Test
        class BadMiddlewareForTest < Authnd::Client::Middleware::Base
        end

        class GoodMiddlewareForTest < Authnd::Client::Middleware::Base
          def initialize(instrumenter:)
            super()
            @instrumenter = instrumenter
          end

          def middleware_name
            "good_test"
          end
        end

        def test_bad_middleware
          middleware = BadMiddlewareForTest.new
          assert_raises(NotImplementedError) do
            middleware.instrument("no good")
          end
        end

        def test_instrument
          middleware = GoodMiddlewareForTest.new(instrumenter: Authnd::Client::Middleware::Instrumenters::Noop)
          Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.good_test.test_op", has_entries(middleware: "good_test", operation: "test_op"))
          middleware.instrument("test_op")
        end
      end
    end
  end
end
