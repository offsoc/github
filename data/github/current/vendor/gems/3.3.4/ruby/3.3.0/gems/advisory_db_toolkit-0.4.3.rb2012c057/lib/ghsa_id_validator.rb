# frozen_string_literal: true

module AdvisoryDBToolkit
  module GHSAIDValidator
    PATTERN = /\AGHSA(?:-[23456789cfghjmpqrvwx]{4}){3}\z/

    def self.valid?(value)
      PATTERN.match?(value)
    end
  end
end
