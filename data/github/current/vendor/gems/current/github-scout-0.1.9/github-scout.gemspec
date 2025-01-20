# frozen_string_literal: true

require_relative "lib/scout/version"

Gem::Specification.new do |spec|
  spec.name          = "github-scout"
  spec.version       = Scout::VERSION
  spec.authors       = "GitHub"
  spec.email         = ["anuragc617@github.com", "bishal-pdmsft@github.com"]

  spec.summary       = "GitHub tech stack detection"
  spec.description   = "We use the scout library to detect blob stack"
  spec.homepage      = "https://github.com/github/scout"
  spec.license       = "MIT"
  spec.required_ruby_version = Gem::Requirement.new(">= 2.4.0")

  spec.metadata = {
    "github_repo" => "ssh://github.com/github/scout"
  }


  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    `git ls-files -z`.split("\x0").reject { |f| f.match(%r{\A(?:test|spec|features)/}) }
  end
  spec.bindir        = "bin"
  spec.executables   = ["scout"]
  spec.require_paths = ["lib"]

  spec.add_dependency "github-linguist", "~> 8"

  spec.add_development_dependency 'rake'
  spec.add_development_dependency 'bundler', '>= 1.10'
  spec.add_development_dependency 'minitest', '~> 5.14'
  spec.add_development_dependency 'rake-compiler', '~> 0.9'
  spec.add_development_dependency 'mocha'


  # For more information and examples about making a new gem, checkout our
  # guide at: https://bundler.io/guides/creating_gem.html
end
