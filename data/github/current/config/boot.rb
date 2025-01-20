# frozen_string_literal: true

# Our normal config/basic, instead of loading Bundler.
# In a vanilla Rails project, this would be loading Bundler
# and doing a weird little vendor vs. RubyGems Rails dance. We're
# special, so we don't do any of that crap.
require File.expand_path("../basic", __FILE__)
