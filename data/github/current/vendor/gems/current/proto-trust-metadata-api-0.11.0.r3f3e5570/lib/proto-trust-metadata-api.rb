# typed: true

require_relative "proto/trust-metadata-api/version"
require_relative "proto/trust-metadata-api/client"

Dir["#{File.dirname(__FILE__)}/**/*_twirp.rb"].each { |file| require_relative file }
