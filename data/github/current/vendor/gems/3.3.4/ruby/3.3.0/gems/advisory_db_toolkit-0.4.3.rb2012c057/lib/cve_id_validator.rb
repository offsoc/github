# frozen_string_literal: true

module AdvisoryDBToolkit
  module CVEIDValidator
    # This pattern is limited to 40 characters because our database columns are.
    CONTAINING_STRING_PATTERN = /(?<prefix>CVE)-(?<year>\d{4})-(?<sequence>\d{4,31})/
    PATTERN = /\A#{CONTAINING_STRING_PATTERN}\z/

    def self.contains_valid?(string)
      CONTAINING_STRING_PATTERN.match?(string)
    end

    def self.valid?(value)
      PATTERN.match?(value)
    end
  end
end
