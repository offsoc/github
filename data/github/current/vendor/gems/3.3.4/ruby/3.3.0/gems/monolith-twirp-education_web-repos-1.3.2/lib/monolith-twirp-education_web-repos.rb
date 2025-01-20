# frozen_string_literal: true

require "monolith_twirp/education_web/repos/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module EducationWeb
      module Repos
        class Error < StandardError; end
      end
    end
  end
end
