# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class DemoGitHubApp < Seeds::Runner
      DEFAULT_NAME = "Super CI"
      DEFAULT_PORT = "9292"

      def self.help
        <<~HELP
Create GitHub App (Integration) and install on the GitHub org.

Instructions are printed to the Standard Error stream (STDERR).
The generated config will be printed to the Stardard Output stream (STDOUT).

This means that instructions/errors will be separated from the config.

If we redirect the output of the script to a file with `>`, e.g. with `bin/seed demo_github_app > my-file.txt`,
then only the config will end up in the file.
        HELP
      end

      def self.run(options = {})
        port = options[:port]
        app_name = app_name(options[:name], port)
        app_url = "http://localhost:#{port}"

        app = Integration.find_by(name: app_name)

        unless app
          # let's see if we have a conflicting port
          if Integration.where(url: app_url).exists?
            raise Seeds::Objects::CreateFailed, "#{app_url} is already taken. Set environment variable PORT to select a different port."
          end

          app = Seeds::Objects::Integration.create(
            owner: owner,
            app_name: app_name,
            integration_url: app_url,
            install_automatically: false,
          )
        end

        private_key = generate_key(app: app)
        client_secret = generate_client_secret(app)

        app_config = config(app: app, private_key: private_key, client_secret: client_secret)
        wait = options[:interactive]

        if wait && verbose?
          walk_through_prompt(app_config, port)
        end

        installation = Seeds::Objects::Integration.install(integration: app, repo: nil, target: owner, installer: admin_user)

        if verbose?
          STDERR.puts <<-TXT
Integration: #{app.name}
Installed on: #{installation.repositories.pluck(:name)}
          TXT
        end

        if !wait && verbose?
          STDERR.puts <<-TXT
Copy the below config to the .env file in the demo app.

#{"-" * 30}
          TXT

          STDOUT.puts app_config
          STDOUT.puts "GITHUB_APP_INSTALLATION_ID=#{installation.id}"
        end
      end

      class << self
        private

        def admin_user
          return @admin_user if defined?(@admin_user)
          @admin_user = Seeds::Objects::User.monalisa
        end

        def app_name(name, port)
          [name, port].compact.join(" ")
        end

        def config(app:, private_key:, client_secret:)
          <<-TXT
BASE_URL="#{app.url}"
GITHUB_API_ENDPOINT="http://api.github.localhost/"
GITHUB_KEY="#{app.key}"
GITHUB_SECRET="#{client_secret}"
WEBHOOK_SECRET="foo123"
GITHUB_APP_IDENTIFIER="#{app.id}"
GITHUB_APP_PRIVATE_KEY="#{private_key}"
          TXT
        end

        def generate_client_secret(app)
          app.generate_client_secret(creator: admin_user, bypass_secrets_limit: true).secret
        end

        def generate_key(app:)
          key = app.generate_key(creator: admin_user)
          pem = key.private_key.to_pem
          pem.gsub(/\n/, '\n').strip
        end

        def owner
          return @owner if defined?(@owner)
          @owner = Seeds::Objects::Organization.github
        end

        # Don't print our the results during tests.
        def verbose?
          !Rails.env.test?
        end

        def walk_through_prompt(config, port)
          if STDOUT.isatty
            plan = "Print it to the screen"
            todo = "Copy the config to the .env file in the demo app"
          else
            plan = "Redirect the output to a file"
            todo = "Make sure the config file is in the demo app"
          end

          STDERR.puts "\nThis is the plan:\n\n"
          STDERR.puts "* The script will:"
          STDERR.puts "    * Generate a config."
          STDERR.puts "    * #{plan}."
          STDERR.puts "* Then you need to:"
          STDERR.puts "    * #{todo}."
          STDERR.puts "    * Start the demo app server."
          STDERR.puts "    * Make sure github/github and github/hookshot are running."
          STDERR.puts "\nReady? Hit [ENTER]"

          STDIN.gets

          if STDOUT.isatty
            STDERR.puts
            STDERR.puts "Copy the below config to the .env file in the demo app."
            STDERR.puts
            STDERR.puts "-" * 30
          end

          STDOUT.puts config

          if STDOUT.isatty
            STDERR.puts "-" * 30
          else
            STDERR.puts
            STDERR.puts "The config has been written."
          end

          STDERR.puts "Start the server on port #{port}. Make sure github/github and github/hookshot are running, too."
          STDERR.puts "Done? Hit [ENTER]"

          STDIN.gets
        end
      end
    end
  end
end
