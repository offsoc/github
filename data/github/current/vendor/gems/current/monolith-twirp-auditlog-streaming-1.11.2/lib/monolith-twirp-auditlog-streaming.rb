# frozen_string_literal: true

require "monolith_twirp/auditlog/streaming/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module Auditlog
      module Streaming
        class Error < StandardError; end
      end
    end
  end
end
