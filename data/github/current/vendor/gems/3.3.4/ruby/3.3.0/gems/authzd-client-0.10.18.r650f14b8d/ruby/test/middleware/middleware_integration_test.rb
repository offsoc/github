# frozen_string_literal: true

require_relative "../test_helper"

module Authzd
  module Middleware
    class MiddlewareIntegrationTest < Minitest::Test
      # This address is non-routable, reserved for private networks
      # Connecting to this address is valid, but a response won't
      # ever be received
      UNROUTABLE_ADDR = "http://10.255.255.255"

      FAILING_CONN = Faraday.new(url: UNROUTABLE_ADDR) do |f|
        f.adapter(:net_http)
        f.options[:timeout] = 0.01
        f.options[:open_timeout] = 0.01
      end

       describe "middleware" do
        def test_single_middleware
          error_tracker = ErrorTracker.new
          client = Authzd::Authorizer::Client.new(FAILING_CONN) do |c|
            c.use :authorize, with: error_tracker
          end

          decision = client.authorize(Authzd::Proto::Request.new)
          assert_kind_of Authzd::Proto::Decision, decision
          assert_equal :INDETERMINATE, decision.result
          assert_match(/execution expired/, decision.reason)

          assert_equal 1, error_tracker.errors.count
          assert_kind_of Faraday::ConnectionFailed, error_tracker.errors.first
        end

        def test_single_middleware_as_class_and_args
          client = Authzd::Authorizer::Client.new(FAILING_CONN) do |c|
            c.use :authorize, with: [[ErrorTracker, StandardError]]
          end

          decision = client.authorize(Authzd::Proto::Request.new)
          assert_kind_of Authzd::Proto::Decision, decision
          assert_equal :INDETERMINATE, decision.result
          assert_match(/execution expired/, decision.reason)
        end

        def test_multiple_middleware
          error_tracker = ErrorTracker.new
          client = Authzd::Authorizer::Client.new(FAILING_CONN) do |c|
            c.use :authorize, with: [[ResultHandler, :INDETERMINATE, :DENY], error_tracker]
          end

          decision = client.authorize(Authzd::Proto::Request.new)
          assert_kind_of Authzd::Proto::Decision, decision
          assert_equal :DENY, decision.result
          assert_match(/execution expired/, decision.reason)

          assert_equal 1, error_tracker.errors.count
          assert_kind_of Faraday::ConnectionFailed, error_tracker.errors.first
        end

        def test_invalid_middleware
          middleware = ErrorTracker.new
          assert_raises Authzd::DecorationError do
            Authzd::Authorizer::Client.new(UNROUTABLE_ADDR) do |c|
              c.use :notamethod, with: middleware
            end
          end
        end

        def test_duplicated_middleware
          middleware = ErrorTracker.new
          same_middleware = middleware
          ex = assert_raises Authzd::DecorationError do
            Authzd::Authorizer::Client.new(UNROUTABLE_ADDR) do |c|
              c.use :authorize, with: [middleware, same_middleware]
            end
          end
          assert /Cannot use middleware instance more than once/ =~ ex.message
        end
      end
    end

    # This middleware rescues StandardError returning an :INDETERMINATE decision
    # and keeping track of the rescued errors
    class ErrorTracker
      attr_reader :errors, :rescue_from
      attr_accessor :request

      def initialize(rescue_from = Faraday::ConnectionFailed)
        @rescue_from = rescue_from
        @errors = []
      end

      def perform(*args)
        self.request.perform(*args)
      rescue rescue_from => ex
        @errors << ex
        Authzd::Proto::Decision.new(result: Authzd::Proto::Result::INDETERMINATE, reason: ex.message)
      end
    end

    # This middleware checks for the result of the next middleware, and if it returned
    # a specific decision, it maps it to a :DENY decision
    class ResultHandler
      attr_accessor :request

      def initialize(original_decision, new_decision)
        @original_decision = original_decision
        @new_decision = new_decision
      end

      def perform(*args)
        decision = self.request.perform(*args)
        if decision.result == @original_decision
          decision = Authzd::Proto::Decision.new(result: @new_decision, reason: decision.reason)
        end
        decision
      end
    end
  end
end
