# frozen_string_literal: true

require "monolith_twirp/event_hydrator/event_hydration/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module EventHydrator
      module EventHydration
        class Error < StandardError; end
      end
    end
  end
end
