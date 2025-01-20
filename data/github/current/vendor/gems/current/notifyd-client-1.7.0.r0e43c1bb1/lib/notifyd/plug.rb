# typed: true
# frozen_string_literal: true

module Notifyd
  # A plug is an object that modifies a given Faraday::Connection
  module Plug
    include Kernel

    # Every Plug has to implement the #inject method
    def inject(conn)
      raise NotImplementedError, "#inject must be implemented by including classes"
    end
  end
end
