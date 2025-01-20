# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Users < Seeds::Runner
      def self.help
        <<~HELP
        Creates a new user.
        HELP
      end

      def self.run(options = {})
        login = options[:login]
        email = options[:email]
        Seeds::Objects::User.create(login: login, email: email)
      end
    end
  end
end
