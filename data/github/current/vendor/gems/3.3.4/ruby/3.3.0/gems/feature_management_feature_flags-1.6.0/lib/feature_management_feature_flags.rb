# frozen_string_literal: true

require_relative "./version"
Dir["#{__dir__}/feature_management/feature_flags/**/*.rb"].each {|file| require file }

module FeatureManagement
  module FeatureFlags
    class Error < StandardError; end
  end
end
