# frozen_string_literal: true

require "github/proto/repositories/version"

$LOAD_PATH.unshift File.join(File.dirname(__FILE__), "github", "proto", "repositories")

Dir["#{File.dirname(__FILE__)}/github/**/*_twirp.rb"].each { |file| require file }

module GitHub
  module Proto
    module Repositories
      class Error < StandardError; end
    end
  end
end
