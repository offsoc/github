# frozen_string_literal: true

require "github/proto/octocat/version"

$LOAD_PATH.unshift File.join(File.dirname(__FILE__), "github", "proto", "octocat")

Dir["#{File.dirname(__FILE__)}/github/**/*_twirp.rb"].each { |file| require file }

module GitHub
  module Proto
    module Octocat
      class Error < StandardError; end
    end
  end
end
