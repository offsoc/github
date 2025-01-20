# frozen_string_literal: true

module Authnd
  module Client
    # constants for the authenticate response attribute values
    # ex: (see https://thehub.github.com/epd/engineering/products-and-services/authentication/authnd/ruby-client)
    # resp = authenticator.Authenticate(context.Background(), ipAddr, req)
    # resp.Attributes["actor.type"] == client.ACTOR_TYPE_USER

    # actor.type values
    ACTOR_TYPE_USER = "User"
    ACTOR_TYPE_REPO = "Repo"

    # application.type values
    APPLICATION_TYPE_OAUTHAPPLICATION = "OAuthApplication"
    APPLICATION_TYPE_GITHUBAPPLICATION = "GithubApplication"

    # credential.type values
    CREDENTIAL_TYPE_LOGINPASSWORD = "LoginPassword"
    CREDENTIAL_TYPE_SSHPUBLICKEY = "SSHPublicKey"
    CREDENTIAL_TYPE_PERSONALACCESSTOKEN = "PersonalAccessToken"
    CREDENTIAL_TYPE_SIGNEDAUTHTOKEN = "SignedAuthToken"
  end
end
