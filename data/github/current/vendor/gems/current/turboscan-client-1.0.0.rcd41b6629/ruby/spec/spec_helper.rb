# frozen_string_literal: true

require "turboscan"
require "vcr"

VCR.configure do |c|
  c.cassette_library_dir = File.join(
    File.expand_path(__dir__), "fixtures/vcr_cassettes"
  )
  c.hook_into :webmock
end
