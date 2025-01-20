#!/usr/bin/env ruby
# frozen_string_literal: true
# Usage: ./bin/generate generate-jwt.rb path_to_pem app_id
# generates a JWT token suitable to be used with certain REST API's
# https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#authenticating-as-a-github-app

require File.expand_path("../../config/basic", __FILE__)
require "openssl"
require "jwt"

path_to_pem = ARGV[0]
app_id = ARGV[1]

# Private key contents
private_pem = File.read(path_to_pem)
private_key = OpenSSL::PKey::RSA.new(private_pem)

# Generate the JWT
payload = {
  # issued at time
  iat: Time.now.to_i,
  # JWT expiration time (10 minute maximum)
  exp: Time.now.to_i + (10 * 60),
  # GitHub App's identifier
  iss: app_id,
}

jwt = JWT.encode(payload, private_key, "RS256")
puts jwt
