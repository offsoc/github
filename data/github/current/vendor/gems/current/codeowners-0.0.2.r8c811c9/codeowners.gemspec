# coding: utf-8
# frozen_string_literal: true
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'codeowners/version'

Gem::Specification.new do |spec|
  spec.name          = "codeowners"
  spec.version       = Codeowners::VERSION
  spec.authors       = ["Brandon Keepers"]
  spec.email         = ["brandon@opensoul.org"]
  spec.summary       = %q{List the members of a CODEOWNERS file.}
  spec.homepage      = ""
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0")
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_dependency "pathspec", "~> 2.1.0"

  spec.add_development_dependency "minitest", "~> 5.9"
  spec.add_development_dependency "rake", "~> 13.0"
  spec.add_development_dependency "benchmark-ips", "~> 2.7"
  spec.add_development_dependency "ruby-prof"
  spec.add_development_dependency "rubocop-performance"
end
