# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class OauthApplication
      def self.create(owner:, name: nil, url: "http://example.com", callback_url: "http://example.com/oauth/callback")
        application = ::OauthApplication.new(
          user: owner,
          name: name || "#{Faker::Company.name} #{::OauthApplication.count}",
          url: url,
          callback_url: callback_url,
        )

        if existing = ::OauthApplication.where(name: application.name).first
          puts "> Using existing OAuth application: #{existing.name}"
          return existing
        end

        puts "> Creating OAuth application: #{application.name}"
        application.save!
        application
      end
    end
  end
end
