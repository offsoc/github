# typed: true
# frozen_string_literal: true

require "faker"

module Seeds
  module DataHelper
    # We want to always use a random username that has not been used before.
    # To ensure this, we can add a random number to end of the username.
    def self.random_username(specifier: nil, separators: %w[-])
      [
        Faker::Internet.username(specifier: specifier, separators: separators),
        SecureRandom.hex[0..7]
      ].join(separators.first)
    end

    # We want to always use a random company slug that has not been used before.
    # To ensure this, we can add a random number to end of the slug.
    def self.random_company_slug(separators: %w[-])
      [
        Faker::Company.name.parameterize[0..39 - 8 - 1],
        SecureRandom.hex[0..7] # 8 characters
      ].join(separators.first)
    end

    def self.random_email(name: nil, separators: %w[-], domain: nil)
      [
        random_username(specifier: name, separators: separators),
        Faker::Internet.domain_name(domain: domain)
      ].join("@")
    end
  end
end
