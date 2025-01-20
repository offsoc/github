#!/usr/bin/env ruby
# typed: true
# frozen_string_literal: true
# Usage: ./bin/generate-password-hash.rb <password>
# generates a password suitable for a user
require "github/password"

password = ARGV[0]

puts GitHub::Password.create(password)
