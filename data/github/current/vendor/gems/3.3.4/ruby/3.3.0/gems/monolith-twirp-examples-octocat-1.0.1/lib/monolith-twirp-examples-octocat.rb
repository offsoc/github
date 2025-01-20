# frozen_string_literal: true

require "monolith_twirp/examples/octocat/version"

$LOAD_PATH.unshift File.join(File.dirname(__FILE__), "monolith_twirp", "examples", "octocat")

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module Examples
      module Octocat
        class Error < StandardError; end
      end
    end
  end
end
