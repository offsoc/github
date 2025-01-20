require 'egress/access_control'

module Egress
  # Public: Helper method to cleanly check access so that you can make a call
  # like this:
  #
  #    Egress.access.allowed?(BlogPost, context)
  #
  # Feel free to make a similar definition in your own module for clarity.
  #
  # Returns true if access is allowed, otherwise false.
  def self.access
    AccessControl
  end
end
