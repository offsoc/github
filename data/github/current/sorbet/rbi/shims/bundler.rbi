# typed: strict
# frozen_string_literal: true

# Tapioca runs enough of bundler to pick up this change from Bundler 2.5
# https://github.com/rubygems/rubygems/commit/84394919fb#diff-36731ca71b06cbab24056b8f0fe3c460127eda6d29e3381e44666bef617404deR70-R79
# and add the Process extend to some of our gem rbi files.
# But bin/srb tc doesn't load bundler, so having it in our rbis causes type
# errors. This change isn't ideal, but should be enough to make the errors go
# away for now.
class Bundler::ConnectionPool
  module ForkTracker
  end
end
