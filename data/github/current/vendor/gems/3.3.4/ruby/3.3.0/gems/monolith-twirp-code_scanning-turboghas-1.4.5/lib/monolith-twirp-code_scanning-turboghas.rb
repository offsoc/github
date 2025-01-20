# frozen_string_literal: true

require "monolith_twirp/code_scanning/turboghas/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module CodeScanning
      module Turboghas
        class Error < StandardError; end
      end
    end
  end
end
