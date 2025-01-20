# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name = "turboscan-client"
  spec.version = "1.0.0"

  spec.summary = "Twirp client for turboscan"
  spec.homepage = "https://github.com/github/turboscan"
  spec.authors = ["Kevin Sawicki"]
  spec.email = ["kevin@github.com"]

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the "allowed_push_host"
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata["allowed_push_host"] = "TODO: Set to 'http://mygemserver.com'"
  else
    raise "RubyGems 2.0 or newer is required to protect against " \
      "public gem pushes."
  end

  # Specify which files should be added to the gem when it is released.
  spec.files = [
    *Dir.glob("./*.gemspec"),
    *Dir.glob("ruby/**/*.rb"),
    *Dir.glob("ruby/spec/fixtures/vcr_cassettes/**/*.yml"),
  ]
  spec.require_paths = ["ruby/lib"]

  # this version has a security alert but we are stuck with it until github/github upgrades
  spec.add_dependency "google-protobuf", ">= 3.14", "< 5.0"
  spec.add_dependency "twirp", "~> 1.10"
  spec.add_dependency "faraday", ">= 0.15.4"

  spec.add_development_dependency "rspec", "~> 3.9"
  spec.add_development_dependency "vcr", "~> 6.2"
  spec.add_development_dependency "webmock", "~> 3.8"
  spec.add_development_dependency "rubocop-github"
  spec.add_development_dependency "rubocop-performance"
  spec.add_development_dependency "rubocop-rspec"
  spec.add_development_dependency "pry"
end
