# frozen_string_literal: true

require "monolith_twirp/git_src_migrator/migrations/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module GitSrcMigrator
      module Migrations
        class Error < StandardError; end
      end
    end
  end
end
