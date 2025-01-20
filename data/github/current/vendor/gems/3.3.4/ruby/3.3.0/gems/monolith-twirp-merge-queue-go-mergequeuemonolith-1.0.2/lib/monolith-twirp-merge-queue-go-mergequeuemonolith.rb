# frozen_string_literal: true

require "monolith_twirp/merge-queue-go/mergequeuemonolith/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module MergeQueueGo
      module Mergequeuemonolith
        class Error < StandardError; end
      end
    end
  end
end
