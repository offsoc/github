# frozen_string_literal: true

require "monolith_twirp/pages/pagesdeployerapi/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module Pages
      module Pagesdeployerapi
        class Error < StandardError; end
      end
    end
  end
end
