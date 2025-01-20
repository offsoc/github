# frozen_string_literal: true

require "monolith_twirp/merge-queue-go/mergequeueservice/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module MergeQueueGo
      module Mergequeueservice
        class Error < StandardError; end
      end
    end
  end
end
