# frozen_string_literal: true

require "proto/dependabot-api/version"

$LOAD_PATH.unshift File.join(File.dirname(__FILE__), "proto", "dependabot-api")

Dir["#{File.dirname(__FILE__)}/**/*_twirp.rb"].each { |file| require file }
