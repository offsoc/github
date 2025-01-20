# frozen_string_literal: true

require_relative "lib/console_auth/version"

Gem::Specification.new do |spec|
  spec.name          = "console_auth"
  spec.version       = ConsoleAuth::VERSION
  spec.authors       = ["GitHub, Inc."]
  spec.email         = ["security@github.com"]

  spec.summary       = "Production console access control and logging"
  spec.homepage      = "https://github.com/github/console_auth"
  spec.required_ruby_version = Gem::Requirement.new(">= 2.4.0")

  spec.metadata["allowed_push_host"] = "https://rubygems.pkg.github.com"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/github/console_auth"
  spec.metadata["changelog_uri"] = "https://github.com/github/console_auth/CHANGELOG.md"

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    `git ls-files -z`.split("\x0").reject { |f| f.match(%r{\A(?:test|spec|features)/}) }
  end
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_runtime_dependency "failbot", ">= 2.0", "< 4"
  spec.add_runtime_dependency "fido-challenger-client", "~> 0.5"

  spec.add_development_dependency "pry", "~> 0.14"
  spec.add_development_dependency "rake", "~> 13.0"
  spec.add_development_dependency "rspec", "~> 3.0"
  spec.add_development_dependency "rubocop", "~> 1.7"
  spec.add_development_dependency "webmock", "~> 2.3"
end
