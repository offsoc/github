require "helper"
require "octolytics/response_errors"

module Octolytics
  class ErrorTest < Minitest::Test
    def test_client_error
      error = HttpError.from_response(400, {}, "")
      assert_instance_of HttpClientError, error
      assert_equal 400, error.code
    end

    def test_not_found_error
      error = HttpError.from_response(404, {}, "")
      assert_instance_of NotFoundError, error
      assert_equal 404, error.code
    end

    def test_conflict_error
      error = HttpError.from_response(409, {}, "")
      assert_instance_of ConflictError, error
      assert_equal 409, error.code
    end

    def test_unprocessable_entity_error
      error = HttpError.from_response(422, {}, "")
      assert_instance_of UnprocessableEntityError, error
      assert_equal 422, error.code
    end

    def test_http_server_error
      error = HttpError.from_response(500, {}, "")
      assert_instance_of HttpServerError, error
      assert_equal 500, error.code
    end

    def test_not_an_error
      error = HttpError.from_response(200, {}, "")
      refute error
    end

    def test_string_error_message
      error = HttpError.from_response(500, { "Content-Type" => "text/plain" }, "Internal Server Error")
      assert "HTTP 500 - Internal Server Error", error.message
    end

    def test_json_error_message
      error = HttpError.from_response(400, { "Content-Type" => "application/json" }, %({"message": "You must specify the blah paramter"}))
      assert "HTTP 400 - You must specify the blah parameter", error.message
    end

    def test_original_exception
      original_exception = RuntimeError.new
      error = Error.new(message: "Something went wrong", original_exception: original_exception)

      assert_equal "Something went wrong", error.message
      assert_equal original_exception, error.original_exception
    end

    def test_error_with_string_message
      error = Error.new("Something went wrong")
      assert_equal "Something went wrong", error.message
    end

    def test_server_error_with_string_message
      error = ServerError.new("Something went wrong")
      assert_equal "Something went wrong", error.message
    end

    def test_client_server_error_with_string_message
      error = ServerError.new("Something went wrong")
      assert_equal "Something went wrong", error.message
    end
  end
end
