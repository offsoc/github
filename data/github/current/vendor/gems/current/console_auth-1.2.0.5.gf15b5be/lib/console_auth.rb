# frozen_string_literal: true

require_relative "console_auth/version"
require "failbot"
require "fido_challenger_client"
require_relative "console_monitor"

class ConsoleAuth

  class ConsoleAuthorizationError < StandardError
  end

  class Session
    class << self
      attr_accessor :console_user
      attr_accessor :session_id
    end

    def self.session_id
      @session_id ||= "#{Time.now.to_i}"
    end

    def self.user(name)
      @console_user ||= name
    end

    def self.hrt
      Time.now.utc
    end
  end

  class << self

    def gatekeeper(alowed_password_attempts = 3)
      username, policies = login(alowed_password_attempts)
      return exit unless username && policies

      if access_control(policies)
        Session.user(username)
        # Initialize session logging
        ConsoleMonitor.install
      else
        Failbot.report(ConsoleAuthorizationError.new("User is not a member of a group with console access."), user: username)
        warn("Sorry, you are not authorized to access the console.\n If you need access please read https://saga.githubapp.com/docs/technical/miscellaneous/using-the-production-console.html")
        return exit
      end
    end

    def login(alowed_password_attempts = 3)
      if ENV.has_key?("VAULT_TOKEN") && !ENV["VAULT_TOKEN"].empty?
        login_details = token_login(ENV["VAULT_TOKEN"])
        return login_details unless login_details.nil?
      end

      password_login(alowed_password_attempts)
    end

    def token_login(token)
      begin
        response = vault_client.get("/v1/auth/token/lookup-self", {"Authorization" => "Bearer #{token}"})
        if response&.code == "200"
          username = JSON.parse(response.body).dig("data", "meta", "username")
          policies = JSON.parse(response.body).dig("data", "policies")
          return [username, policies]
        else
          error = JSON.parse(response.body)["errors"]
          warn("The Vault token in your environment was not accepted. It may have expired.")
          warn error
          nil
        end
      rescue
        # Rescue from any connectivity, or socket errors which may occur.
        error = $!
        warn("An error has occurred checking the Vault token from your environment.")
        warn(error)
        nil
      end
    end

    def password_login(attempts_remaining = 3)
      if (attempts_remaining == 0)
        warn("Too many failed attempts. All error messages have been recorded to Haystack. If you need assistance, please review https://thehub.github.com/engineering/security/production-shell-access/access/.")
        return nil
      end

      username = get_username(attempts_remaining)
      password = get_password
      challenge = FIDOChallenger.challenge("#{username}@github.com", "vault")
      prompt("Go here:\n#{challenge.url}")

      response = vault_fido_auth(username, password, challenge.token, attempts_remaining)
      return password_login(attempts_remaining - 1) unless response

      policies = JSON.parse(response.body).dig("auth", "policies")
      return [username, policies]
    end

    def get_username(attempts_remaining)
      if (attempts_remaining == 0)
        Failbot.report(ConsoleAuthorizationError.new("Too many attempts. Invalid username."))
        return gatekeeper(0)
      end

      prompt("Please enter your username:")
      uname = username_input

      unless valid_username(uname)
        warn("Valid usernames can only contain alphanumeric characters, underscores, and dashes.")
        return get_username(attempts_remaining - 1)
      end
      uname
    end

    def username_input
      gets.strip
    end

    def get_password
      prompt("Please enter your dotcom password:")
      STDIN.noecho(&:gets).strip
    end

    def warn(message)
      puts "\033[39;41m#{message}\033[0m"
    end

    def prompt(message)
      puts "\033[93m#{message}\033[0m"
    end

    def vault_fido_auth(username, password, challenge, attempts_remaining)
      login_path = "/v1/auth/fido/login/#{username}"
      begin
        response = vault_client.post(login_path, {"password" => password, "challenge" => challenge}.to_json)
        if response&.code == "200"
          response
        else
          # report exact error returned when authentication fails
          error = JSON.parse(response.body)["errors"]
          Failbot.report(ConsoleAuthorizationError.new(error), status: response.code, user: username)
          warn("Sorry those credentials were not accepted.")
          warn error
          return
        end
      rescue
        # Rescue from any connectivity, or socket errors which may occur.
        error = $!
        Failbot.report(ConsoleAuthorizationError.new(error), user: username)
        warn("An error has occurred with this request")
        warn(error)
        return
      end
    end

    private

    def valid_username(username)
      !username.empty? && username.scan(/[^a-zA-Z\d\-\_]/).empty?
    end

    def access_control(policies)
      policies.include?("ldap-misc-app-gh-console")
    end

    def vault_client
      return @vault_client if defined?(@vault_client)

      uri = URI "https://vault.service.github.net:8200"
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_PEER
      # FIXME: Temporary solution until kubernetes containers recognize the same CAs as
      # our systems do.
      http.ca_file = ca_file

      @vault_client = http
    end

    def ca_file
      # FIXME: Temporary solution until kubernetes containers recognize the same CAs as
      # our systems do.
      ENV["VAULT_CA_FILE"] || File.expand_path('../data/vault_ca.crt', File.dirname(__FILE__))
    end
  end
end
