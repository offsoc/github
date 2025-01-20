# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name = "turbomodel-client"
  spec.version = "1.0.0"

  spec.summary = "Twirp client for turbomodel"
  spec.homepage = "https://github.com/github/turbomodel"
  spec.authors = ["Koen Vlaswinkel"]
  spec.email = ["koesie10@github.com"]
  spec.metadata["github_repo"] = "ssh://github.com/github/turbomodel"
  spec.metadata["allowed_push_host"] = "https://rubygems.pkg.github.com/github"

  spec.files = [
    *Dir.glob("./*.gemspec"),
    *Dir.glob("ruby/**/*.rb"),
    *Dir.glob("ruby/cassettes/**/*.yml"),
  ]
  spec.require_paths = ["ruby/lib"]

  spec.add_runtime_dependency "google-protobuf"
  spec.add_runtime_dependency "twirp"
  spec.add_runtime_dependency "faraday"
end
