# frozen_string_literal: true

$LOAD_PATH.unshift File.expand_path("lib", __dir__)

require "meuse-client/version"

Gem::Specification.new do |spec|
  spec.name = "meuse-client"
  spec.version = Meuse::Client::VERSION

  spec.summary = "Twirp client for Meuse"
  spec.homepage = "https://github.com/github/meuse"
  spec.authors = ["Shawn Aukstakalnis"]
  spec.email = ["ShawnAukstak@github.com"]
  spec.metadata = {
    "allowed_push_host" => "https://rubygems.pkg.github.com",
    "github_repo" => "ssh://github.com/github/meuse",
  }

  # Specify which files should be added to the gem when it is released.
  spec.files = [
    *Dir.glob("./*.gemspec"),
    *Dir.glob("lib/meuse/client.rb"),
    *Dir.glob("lib/meuse-client/*.rb"),
    *Dir.glob("lib/meuse/services/**/*.rb"),
    *Dir.glob("lib/meuse/twirp/hmac/*.rb"),
    *Dir.glob("lib/meuse/request_hmac.rb"),
  ]
  spec.require_paths = ["lib"]

  spec.add_runtime_dependency "activesupport" # for time
  spec.add_runtime_dependency "faraday", ">= 0.17", "< 3" # low version support needed for dotcom
  spec.add_runtime_dependency "twirp", "~> 1.1" # low version support needed for dotcom
end
