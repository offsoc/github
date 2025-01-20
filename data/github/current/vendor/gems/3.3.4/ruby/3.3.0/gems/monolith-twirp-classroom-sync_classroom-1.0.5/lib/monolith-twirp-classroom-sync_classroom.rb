# frozen_string_literal: true

require "monolith_twirp/classroom/sync_classroom/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module Classroom
      module SyncClassroom
        class Error < StandardError; end
      end
    end
  end
end
