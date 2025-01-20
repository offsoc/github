#!/usr/bin/env safe-ruby
# typed: true
# frozen_string_literal: true

require_relative "../config/environment"
require "github/kredz_client"
require "optparse"

unless Rails.env.development?
  abort "This can only be run in development"
end

$enterprise = false
options = OpenStruct.new
opts = OptionParser.new do |opts|
  opts.banner = "Usage: create-dependabot-secrets.rb [--enterprise]"
  opts.on("--enterprise") do
    $enterprise = true
  end
end.parse!

class DependabotSecretFixtures
  CALLING_CARD = <<~'CALLING_CARD'
    You are all set with some test secrets for the Dependabot service ♥️

    %{secret_list}

    Slack : #dependabot-updates
    Issues: https://github.com/github/dependabot-updates
  CALLING_CARD

  def initialize
    @mona = User.find_by!(login: "monalisa")
    @gh = Organization.find_by!(login: "github")
    @app = GitHub.dependabot_github_app
    @removed = []
    @added = []
  end

  def call
    user_repo = repository_for(name: "sekret-octoapp", owner: @mona)
    org_repo = repository_for(name: "sekret-octoapp-pro", owner: @gh)

    @removed += reset_secrets(owner: user_repo, actor: @mona)
    @added << create_secret(owner: user_repo, actor: @mona, name: "REPO_TEST", secret: "this is a Dependabot repo secret")

    @removed += reset_secrets(owner: org_repo, actor: @mona)
    @added << create_secret(owner: org_repo, actor: @mona, name: "REPO_TEST", secret: "this is a Dependabot repo secret")

    @removed += reset_secrets(owner: @gh, actor: @mona)
    @added << create_secret(owner: @gh, actor: @mona, name: "ORG_TEST", secret: "this is a Dependabot org secret available to all repos")
    @added << create_secret(owner: @gh, actor: @mona, name: "REPO_TEST", secret: "this is a Dependabot org secret that will be overridden by a repo")
  end

  def calling_card
    CALLING_CARD % { secret_list: secret_list }
  end

  private

  def secret_list
    msg_lines = ["Updated secrets:"]
    msg_lines += @added

    deleted = @removed - @added
    if deleted.any?
      msg_lines << ""
      msg_lines << "Removed secrets:"
      msg_lines += deleted
    end

    msg_lines.join("\n")
  end

  def repository_for(name:, owner:)
    Repository.nwo("#{owner.login}/#{name}")
  end

  def reset_secrets(owner:, actor:)
    existing_secrets = Secrets.list(
      app: @app,
      owner: owner,
      actor: actor,
    )

    existing_secrets.credentials.each do |c|
      Secrets.delete(
        app: @app,
        owner: owner,
        actor: actor,
        name: c.name,
      )
    end

    existing_secrets.credentials.map { |c| key_for(owner, c.name) }
  end

  def create_secret(owner:, actor:, name:, secret:)

    if $enterprise
      value = secret
    else
      public_key_id, encoded_public_key = Secrets.github_public_key(owner: owner, key_name: Platform::EncryptionKeys::DEPENDABOT_SECRETS)
      # Encrypt the secret as the client would, per https://developer.github.com/v3/actions/secrets/#example-encrypting-a-secret-using-ruby
      public_key = RbNaCl::PublicKey.new(Base64.decode64(encoded_public_key))
      box = RbNaCl::Boxes::Sealed.from_public_key(public_key)
      encrypted_secret = box.encrypt(secret)
      value = Secrets.embed(public_key_id, encrypted_secret)
    end

    # format/encode value
    encoded_value = Base64.strict_encode64(value)

    visibility = if owner.is_a?(Organization)
      GitHub::KredzClient::Credz::CREDENTIAL_VISIBILITY_PRIVATE_REPOS
    else
      GitHub::KredzClient::Credz::CREDENTIAL_VISIBILITY_OWNER
    end

    Secrets.update(
      app: @app,
      owner: owner,
      actor: actor,
      name: name,
      value: encoded_value,
      visibility: visibility,
      selected_repositories: [],
    )

    key_for(owner, name)
  end
end

def key_for(owner, name)
  if owner.is_a?(Organization)
    "org:#{owner.name}:#{name}"
  else
    "repo:#{owner.nwo}:#{name}"
  end
end

if __FILE__ == $0
  bootstrap = DependabotSecretFixtures.new

  bootstrap.call

  puts "\n"
  puts bootstrap.calling_card
end
