# frozen_string_literal: true

# ensure this file is not required multiple times due
# to different require paths.
$LOADED_FEATURES << "config/environment.rb"
$LOADED_FEATURES << File.expand_path(__FILE__)

# Load the rails application
require File.expand_path("../application", __FILE__)

# Initialize the rails application
GitHub::Application.initialize!
