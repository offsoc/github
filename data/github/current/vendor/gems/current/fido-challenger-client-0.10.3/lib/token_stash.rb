# frozen_string_literal: true
require "json"
require "tmpdir"
require "digest"

# Stash a serialization of challenge in Dir.tmpdir
# This is particularly useful for sshd
class TokenStash
  def self.write(user, token)
    File.open(path_for_user(user), "w") do |f|
      f.puts(JSON.generate({ token: token }))
    end
  end

  def self.read(user)
    file = File.read(path_for_user(user))
    json = JSON.parse(file)
    json["token"]
  end

  def self.path_for_user(user)
    "#{Dir.tmpdir}/#{hash(user)}.json"
  end

  # Hash the user to reduce the chance of path manipulation
  def self.hash(user)
    Digest::SHA256.hexdigest(user)
  end
end
