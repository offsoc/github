# frozen_string_literal: true

require "monolith_twirp/classroom/assignment_reuse/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module Classroom
      module AssignmentReuse
        class Error < StandardError; end
      end
    end
  end
end
