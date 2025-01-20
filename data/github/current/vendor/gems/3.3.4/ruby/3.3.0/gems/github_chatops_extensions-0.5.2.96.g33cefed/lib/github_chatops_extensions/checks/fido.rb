# frozen_string_literal: true

require "fido_challenger_client"
require "json"

require_relative "base"
require_relative "../helpers/chatterbox"

module GitHubChatopsExtensions
  module Checks
    module Includable
      module Fido
        def require_fido_2fa
          banner = ".#{self.class.chatops_namespace} #{params[:action]}"
          checker = GitHubChatopsExtensions::Checks::Fido.new(params, banner, logger)
          begin
            checker.check_2fa

            # We make the challenge token available to other ChatOps so they can use it in logging
            @fido_challenge_token = checker.challenge_token
          rescue GitHubChatopsExtensions::Errors::FidoFailure, GitHubChatopsExtensions::Errors::FidoUnauthorized => exc
            jsonrpc_response(result: "@#{params[:user]}: `#{banner}` tfa failed: #{exc.message}\n*Hint*: You only have a few seconds to verify yourself. You can retry without worry.")
          end
        end
      end
    end

    class Fido < Base
      attr_reader :challenge_token

      def check_2fa
        if !ENV.has_key?("FIDO_CHALLENGER_URL") || ENV["FIDO_CHALLENGER_URL"].empty?
          raise GitHubChatopsExtensions::Errors::FidoSetupFailure, "Misconfiguration: missing environment variable 'FIDO_CHALLENGER_URL'"
        end

        challenge = fido_challenge
        @challenge_token = challenge.token

        # If the challenge passes a first status, it's a bypass since we haven't prompted yet
        if fido_check(challenge, false) == :success
          logger.info "2fa allowed for #{user} (likely bypass)"
          say("@#{user} :fido-bright: authentication successful for `#{banner}` (likely bypass).")
          return true
        end

        say(two_fa_message(challenge.url))
        result = fido_check(challenge)
        if result == :success
          logger.info "2fa allowed for #{user}"
          return true
        else
          tfa_fail("2fa DENIED: #{result} :lock:", GitHubChatopsExtensions::Errors::FidoUnauthorized)
        end
      end

      private

      def say(message)
        GitHubChatopsExtensions::Helpers::Chatterbox.say_out_of_band(
          user:,
          room_id:,
          message:
        )
      end

      def fido_challenge
        service = "chatops-fido-2fa-#{banner.split.first.gsub(".", "")}"

        FIDOChallenger.challenge(email, service)
      end

      def fido_check(challenge, poll = true)
        if poll
          fido_poll(challenge)
        else
          fido_status(challenge)
        end
      rescue FIDOChallenger::FIDOChallengerFailOpenError => e
        # if we just failed on the first check, try the rest of the process
        unless poll
          logger.error "2fa Error for #{user} error: #{e.inspect}"
          return :failure
        end
        logger.error "2fa DENIED for #{user} due to error: #{e.inspect}"
        tfa_fail("2fa Error: #{e.inspect} :lock:", GitHubChatopsExtensions::Errors::FidoFailure)
      end

      def fido_poll(challenge)
        timeout = 20
        if ENV.key?("FIDO_CHALLENGER_TIMEOUT") && !ENV["FIDO_CHALLENGER_TIMEOUT"].empty?
          timeout = ENV["FIDO_CHALLENGER_TIMEOUT"].to_i
        end

        FIDOChallenger.poll_status(challenge.token, timeout)
      end

      def fido_status(challenge)
        FIDOChallenger.status(challenge.token)
      end

      def email
        "#{user}@github.com"
      end

      def two_fa_message(url)
        msg = ":fido-bright: authentication required for `#{banner}`. Click the link to authorize."
        msg + "\n#{url}"
      end

      def tfa_fail(msg = "", clazz = GitHubChatopsExtensions::Errors::FidoFailure)
        logger.error "2FA for #{user} failed for #{banner}: #{msg}"
        raise clazz, "@#{user}: \`#{banner}\` tfa failed: #{msg}"
      end
    end
  end
end
