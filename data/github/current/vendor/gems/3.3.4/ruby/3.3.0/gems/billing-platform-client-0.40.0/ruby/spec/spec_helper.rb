# frozen_string_literal: true

require 'webmock/rspec'

require 'simplecov'
SimpleCov.start

require "billing-platform"
require "support/twirp_test_helpers"

RSpec.configure do |config|
  config.disable_monkey_patching!

  config.expect_with :rspec do |c|
    c.syntax = :expect
  end
end
