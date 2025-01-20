# frozen_string_literal: true

require "github/spokes/proto/version"

require "github/spokes/proto/client"
require "github/spokes/proto/gitauth"
require "github/spokes/proto/types"
require "github/spokes/proto/helpers/mode"

$LOAD_PATH.unshift File.join(File.dirname(__FILE__), "github", "spokes", "proto")

Dir["#{File.dirname(__FILE__)}/github/**/*_twirp.rb"].each { |file| require file }

module GitHub
  module Spokes
    module Proto
    end
  end
end
