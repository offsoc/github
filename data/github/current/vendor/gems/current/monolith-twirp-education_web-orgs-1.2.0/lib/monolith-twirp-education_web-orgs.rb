# frozen_string_literal: true

require "monolith_twirp/education_web/orgs/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module EducationWeb
      module Orgs
        class Error < StandardError; end
      end
    end
  end
end
