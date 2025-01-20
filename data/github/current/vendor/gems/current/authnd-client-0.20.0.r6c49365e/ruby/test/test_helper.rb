# frozen_string_literal: true

require "simplecov"
if ENV["COVERAGE"] == "1"
  SimpleCov.start do
    add_filter "/test/"
  end
end

require "minitest/autorun"

require "google/protobuf"
require "authnd-client"

require "mocha/minitest"

require_relative "./client/service_client_test_helpers"
