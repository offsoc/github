# frozen_string_literal: true

require_relative "lib/sarif/version"

Gem::Specification.new do |spec|
  spec.name = "sarif"
  spec.version = Sarif::VERSION
  spec.authors = ["Simon Engledew"]
  spec.email = ["simon-engledew@github.com"]

  spec.summary = "parse, verify and extract SARIF documents"
  spec.description = "Extracts information from SARIF documents"
  spec.homepage = "https://github.com/github/sarif-gem"
  spec.license = "MIT"
  spec.required_ruby_version = ">= 2.6.0"
  spec.required_rubygems_version = ">= 3.3.11"

  spec.metadata["allowed_push_host"] = "https://rubygems.pkg.github.com/github"
  spec.metadata["github_repo"] = "ssh://github.com/github/sarif-gem"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/github/sarif-gem"
  spec.metadata["changelog_uri"] = "https://github.com/github/sarif-gem"

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files = Dir.chdir(__dir__) do
    `git ls-files -z`.split("\x0").reject do |f|
      (File.expand_path(f) == __FILE__) || f.match(%r{\A(?:(?:bin|test|spec|features|vendor)/|\.(?:git|circleci)|appveyor)})
    end
  end
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
  spec.extensions = ["ext/sarif/Cargo.toml"]

  spec.add_development_dependency "minitest", "~> 5.21"
  spec.add_development_dependency "rake", "~> 13.1"
  spec.add_development_dependency "rake-compiler"
  spec.add_development_dependency "rb_sys"

  spec.add_runtime_dependency "ffi"
  spec.add_runtime_dependency "activesupport"
end
