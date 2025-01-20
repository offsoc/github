# frozen_string_literal: true

require "monolith_twirp/conduit/feeds/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module Conduit
      module Feeds
        class Error < StandardError; end
      end
    end
  end
end
