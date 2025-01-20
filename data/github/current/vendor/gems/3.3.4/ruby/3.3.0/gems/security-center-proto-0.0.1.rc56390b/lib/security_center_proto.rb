# frozen_string_literal: true

require "github/proto/security_center/version"

$LOAD_PATH.unshift File.join(File.dirname(__FILE__), "github", "proto", "security_center")
Dir["#{File.dirname(__FILE__)}/github/**/*_twirp.rb"].each { |file| require file }