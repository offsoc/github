# frozen_string_literal: true
# gemspec to be used strictly for using linguist master

require_relative "lib/scout/version"

Gem::Specification.new do |spec|
  spec.name          = "github-scout.nightly-ci"
  spec.version       = Scout::VERSION
  spec.required_ruby_version = Gem::Requirement.new(">= 2.4.0")
  spec.authors       = "GitHub"
  spec.summary       = "GitHub tech stack detection - with linguist master branch"

  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    `git ls-files -z`.split("\x0").reject { |f| f.match(%r{\A(?:test|spec|features)/}) }
  end
  spec.bindir        = "bin"
  spec.executables   = ["scout"]
  spec.require_paths = ["lib"]
end
