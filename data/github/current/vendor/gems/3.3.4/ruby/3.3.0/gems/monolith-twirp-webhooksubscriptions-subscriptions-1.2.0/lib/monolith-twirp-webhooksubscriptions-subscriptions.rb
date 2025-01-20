# frozen_string_literal: true

require "monolith_twirp/webhooksubscriptions/subscriptions/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module Webhooksubscriptions
      module Subscriptions
        class Error < StandardError; end
      end
    end
  end
end
