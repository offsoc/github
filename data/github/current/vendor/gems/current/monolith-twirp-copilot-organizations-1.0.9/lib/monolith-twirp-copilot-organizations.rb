# frozen_string_literal: true

require "monolith_twirp/copilot/organizations/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module Copilot
      module Organizations
        class Error < StandardError; end
      end
    end
  end
end
