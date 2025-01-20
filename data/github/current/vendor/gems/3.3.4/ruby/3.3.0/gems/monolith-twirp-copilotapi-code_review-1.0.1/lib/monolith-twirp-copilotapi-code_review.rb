# frozen_string_literal: true

require "monolith_twirp/copilotapi/code_review/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module Copilotapi
      module CodeReview
        class Error < StandardError; end
      end
    end
  end
end
