# frozen_string_literal: true

require "monolith_twirp/code_scanning/managed_analyses/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module CodeScanning
      module ManagedAnalyses
        class Error < StandardError; end
      end
    end
  end
end
