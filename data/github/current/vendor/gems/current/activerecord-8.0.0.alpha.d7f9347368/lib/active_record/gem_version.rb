# frozen_string_literal: true

module ActiveRecord
  # Returns the currently loaded version of Active Record as a +Gem::Version+.
  def self.gem_version
    Gem::Version.new VERSION::STRING
  end

  module VERSION
    MAJOR = 8
    MINOR = 0
    TINY  = 0
    PRE   = "alpha.d7f9347368"

    STRING = [MAJOR, MINOR, TINY, PRE].compact.join(".")
  end
end
