# frozen_string_literal: true

require_relative "lib/windbeam_api/version"

Gem::Specification.new do |spec|
  spec.name = "windbeam_api"
  spec.version = WindbeamApi::VERSION
  spec.authors = ["Nate Browne"]
  spec.email = ["nate-browne@github.com"]

  spec.summary = "Ruby SDK for Windbeam's Twirp API."
  spec.homepage = "https://github.com/github/windbeam-api-ruby"
  spec.required_ruby_version = ">= 2.6.0"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = spec.homepage
  spec.metadata["changelog_uri"] = spec.homepage

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files = Dir.chdir(__dir__) do
    `git ls-files -z`.split("\x0").reject do |f|
      (f == __FILE__) || f.match(%r{\A(?:(?:bin|test|spec|features|vendor/cache)/|\.(?:git|circleci)|appveyor)})
    end
  end
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_runtime_dependency "faraday"
  spec.add_runtime_dependency "twirp"

  # For more information and examples about making a new gem, check out our
  # guide at: https://bundler.io/guides/creating_gem.html
end
