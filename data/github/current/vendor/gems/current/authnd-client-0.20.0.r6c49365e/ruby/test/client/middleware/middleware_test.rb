# frozen_string_literal: true

module Authnd
  module Client
    module Middleware
      class MiddlewareTest < Minitest::Test
        # This address is non-routable, reserved for private networks
        # Connecting to this address is valid, but a response won't
        # ever be received
        UNROUTABLE_ADDR = "http://10.255.255.255"
        TEST_CATALOG_SERVICE = "github/test-service"

        FAILING_CONN = Faraday.new(url: UNROUTABLE_ADDR) do |f|
          f.adapter(:net_http)
          f.options[:timeout] = 0.01
          f.options[:open_timeout] = 0.01
        end

        describe "middleware" do
          def test_single_middleware
            error_tracker = ErrorTracker.new(rescue_from: Faraday::ConnectionFailed)
            authenticator = Authnd::Client::Authenticator.new(FAILING_CONN, catalog_service: TEST_CATALOG_SERVICE) do |c|
              c.use :authenticate, with: error_tracker
            end

            assert_raises Faraday::ConnectionFailed do
              authenticator.authenticate(Authnd::Proto::AuthenticateRequest.new)
            end

            assert_equal 1, error_tracker.errors.count
            assert_kind_of Faraday::ConnectionFailed, error_tracker.errors.first
          end

          def test_middleware_multiple_functions_sharing_same_middleware_error
            error_tracker = ErrorTracker.new(rescue_from: Faraday::ConnectionFailed)

            ex = assert_raises Authnd::DecorationError do
              Authnd::Client::MobileDeviceManager.new(FAILING_CONN, catalog_service: TEST_CATALOG_SERVICE) do |c|
                c.use %i[find_device_auth_key_registration find_device_auth_key_registrations], with: error_tracker
              end
            end
            assert(/Cannot use middleware instance more than once/ =~ ex.message)
          end

          def test_middleware_multiple_functions_construct_same_middleware
            mdm = Authnd::Client::MobileDeviceManager.new(FAILING_CONN, catalog_service: TEST_CATALOG_SERVICE) do |c|
              c.use %i[find_device_auth_key_registration find_device_auth_key_registrations], with: [[ErrorTracker, { rescue_from: Faraday::ConnectionFailed }]]
            end

            assert_raises Faraday::ConnectionFailed do
              mdm.find_device_auth_key_registration(1, 2)
            end

            assert_raises Faraday::ConnectionFailed do
              mdm.find_device_auth_key_registrations(1)
            end
          end

          def test_middleware_multiple_functions_same_middleware_separate_instances
            error_tracker1 = ErrorTracker.new(rescue_from: Faraday::ConnectionFailed)
            error_tracker2 = ErrorTracker.new(rescue_from: Faraday::ConnectionFailed)

            mdm = Authnd::Client::MobileDeviceManager.new(FAILING_CONN, catalog_service: TEST_CATALOG_SERVICE) do |c|
              c.use :find_device_auth_key_registration, with: [error_tracker1]
              c.use :find_device_auth_key_registrations, with: [error_tracker2]
            end

            assert_raises Faraday::ConnectionFailed do
              mdm.find_device_auth_key_registration(1, 2)
            end

            assert_raises Faraday::ConnectionFailed do
              mdm.find_device_auth_key_registrations(1)
            end

            assert_equal 1, error_tracker1.errors.count
            assert_equal 1, error_tracker2.errors.count
            assert_kind_of Faraday::ConnectionFailed, error_tracker1.errors[0]
            assert_kind_of Faraday::ConnectionFailed, error_tracker2.errors[0]
          end

          def test_multiple_middleware_constructed
            error_tracker = ErrorTracker.new(rescue_from: Faraday::ConnectionFailed)
            error_tracker2 = ErrorTrackerWithOptionalKwarg.new
            authenticator = Authnd::Client::Authenticator.new(FAILING_CONN, catalog_service: TEST_CATALOG_SERVICE) do |c|
              c.use :authenticate, with: [error_tracker, error_tracker2]
            end

            assert_raises Faraday::ConnectionFailed do
              authenticator.authenticate(Authnd::Proto::AuthenticateRequest.new)
            end

            assert_equal 1, error_tracker.errors.count
            assert_kind_of Faraday::ConnectionFailed, error_tracker.errors.first
            assert_equal 1, error_tracker2.errors.count
            assert_kind_of Faraday::ConnectionFailed, error_tracker2.errors.first
          end

          def test_multiple_middleware_applied_to_multiple_functions
            mdm = Authnd::Client::MobileDeviceManager.new(FAILING_CONN, catalog_service: TEST_CATALOG_SERVICE) do |c|
              c.use %i[find_device_auth_key_registration find_device_auth_key_registrations], with: [[ErrorTracker, { rescue_from: Faraday::ConnectionFailed }], ErrorTrackerWithOptionalKwarg]
            end

            assert_raises Faraday::ConnectionFailed do
              mdm.find_device_auth_key_registration(1, 2)
            end

            assert_raises Faraday::ConnectionFailed do
              mdm.find_device_auth_key_registrations(1)
            end
          end

          def test_invalid_middleware
            middleware = ErrorTracker.new(rescue_from: Faraday::ConnectionFailed)
            ex = assert_raises Authnd::DecorationError do
              Authnd::Client::Authenticator.new(FAILING_CONN, catalog_service: TEST_CATALOG_SERVICE) do |c|
                c.use :notamethod, with: middleware
              end
            end
            assert(/is not defined/ =~ ex.message)
          end

          def test_duplicated_middleware
            middleware = ErrorTracker.new(rescue_from: Faraday::ConnectionFailed)
            same_middleware = middleware
            ex = assert_raises Authnd::DecorationError do
              Authnd::Client::Authenticator.new(FAILING_CONN, catalog_service: TEST_CATALOG_SERVICE) do |c|
                c.use :authenticate, with: [middleware, same_middleware]
              end
            end
            assert(/Cannot use middleware instance more than once/ =~ ex.message)
          end

          def test_class_without_required_kargs_missing
            ex = assert_raises Authnd::DecorationError do
              Authnd::Client::Authenticator.new(FAILING_CONN, catalog_service: TEST_CATALOG_SERVICE) do |c|
                c.use :authenticate, with: [MiddlewareRequiredKwarg]
              end
            end
            assert(/missing keyword/ =~ ex.message)
          end

          def test_class_without_required_kargs
            Authnd::Client::Authenticator.new(FAILING_CONN, catalog_service: TEST_CATALOG_SERVICE) do |c|
              c.use :authenticate, with: [[MiddlewareRequiredKwarg, { required_kwarg: "foo" }]]
            end
          end
        end
      end

      # This middleware rescues StandardError returning a :RESULT_UNKNOWN result
      # and keeping track of the rescued errors
      class ErrorTracker < Authnd::Client::Middleware::Base
        attr_reader :errors, :rescue_from

        def initialize(rescue_from:)
          super()
          @rescue_from = rescue_from
          @errors = []
        end

        def perform(*args, headers: {}, **kwargs)
          request.perform(*args, **kwargs, headers: headers)
        rescue rescue_from => e
          @errors << e
          raise e
        end
      end

      # This middleware checks for the result of the next middleware, and if it returned
      # a specific result, it maps it to a different result
      class ErrorTrackerWithOptionalKwarg < Authnd::Client::Middleware::Base
        attr_reader :errors, :rescue_from

        def initialize(rescue_from: Faraday::ConnectionFailed)
          super()
          @rescue_from = rescue_from
          @errors = []
        end

        def perform(*args, headers: {}, **kwargs)
          request.perform(*args, **kwargs, headers: headers)
        rescue rescue_from => e
          @errors << e
          raise e
        end
      end

      class MiddlewareRequiredKwarg
        def initialize(required_kwarg:); end
      end
    end
  end
end
