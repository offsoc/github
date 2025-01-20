# frozen_string_literal: true

require "monolith_twirp/mailreplies/replies/version"

Dir["#{File.dirname(__FILE__)}/monolith_twirp/**/*_twirp.rb"].each { |file| require file }

module Monolith
  module Twirp
    module Mailreplies
      module Replies
        class Error < StandardError; end
      end
    end
  end
end
