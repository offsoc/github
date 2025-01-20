# typed: true
# frozen_string_literal: true

require "faker"
Dir.glob(Rails.root.join("script/seeds/objects/**/*.rb")).each do |file|
  require_relative file
end
require_relative "./data_helper"

# Do not require anything else here. If you need something for your objects, put that in method for the object.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    ObjectError = Class.new(StandardError)
    CreateFailed = Class.new(ObjectError)
    ActionFailed = Class.new(ObjectError)
  end
end
