# frozen_string_literal: true
require_relative "fido_challenger_client"

class CLI
  def initialize(user, resource)
    @user = user
    @resource = resource
  end

  def challenge(attempts: 300)
    puts "Prepare to be challenged!"
    begin
      challenge = FIDOChallenger.challenge(@user, @resource)
    rescue FIDOChallenger::FIDOChallengerFailOpenError
      return 0
    end

    puts "Please follow this link for FIDO authentication:"
    puts challenge.url

    begin
      status = FIDOChallenger.poll_status(challenge.token, attempts)
    rescue FIDOChallenger::FIDOChallengerFailOpenError
      return 0
    end

    handle_status(status)
  end

  def pam_challenge(pam_mode)
    case pam_mode
    when "--prompt"
      begin
        challenge = FIDOChallenger.challenge(@user, @resource)
      rescue FIDOChallenger::FIDOChallengerFailOpenError
        # when used in PAM, FIDO Challenger should fail closed.
        return 1
      end

      puts "Follow the link for FIDO authentication and then submit a blank password:"
      puts challenge.url
      TokenStash.write(@user, challenge.token)
      return 0
    when "--wait"
      token = TokenStash.read(@user)

      begin
        status = FIDOChallenger.poll_status(token, 30)
      rescue FIDOChallenger::FIDOChallengerFailOpenError
        # when used in PAM, FIDO Challenger should fail closed.
        return 1
      end

      handle_status(status)
    when "--check-bypass"
      token = TokenStash.read(@user)

      begin
        status = FIDOChallenger.status(token)
      rescue FIDOChallenger::FIDOChallengerFailOpenError
        # when used in PAM, FIDO Challenger should fail closed.
        return 1
      end

      handle_status(status)
    else
      puts "#{pam_mode} is not a supported argument"
      return 1
    end
  end

  private

  def handle_status(status)
    case status
    when :success
      puts "Good job! Come on in!"
      return 0
    when :pending
      return 1
    when :not_found
      puts "This is strange. The challenge we just created couldn't be found."
      return 1
    else
      puts "Oh dear. Something unexpected has happened.\n#{status}"
      return 1
    end
  end
end
