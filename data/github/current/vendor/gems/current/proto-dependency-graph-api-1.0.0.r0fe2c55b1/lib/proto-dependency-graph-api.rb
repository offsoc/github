# frozen_string_literal: true

$LOAD_PATH.unshift File.join(File.dirname(__FILE__), "proto", "dependency-graph-api")

Dir["#{File.dirname(__FILE__)}/**/*_twirp.rb"].each { |file| require file }
