# typed: true
# frozen_string_literal: true

module HubberCodespace
  def self.hcs?
    !!(ENV["HCS"] == "1")
  end
end
