# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'octolytics/version'

Gem::Specification.new do |spec|
  spec.name          = "octolytics"
  spec.version       = Octolytics::VERSION
  spec.authors       = ["John Nunemaker"]
  spec.email         = ["nunemaker@gmail.com"]
  spec.description   = %q{Wrapper for Octolytics stuff.}
  spec.summary       = %q{Wrapper for Octolytics stuff.}
  spec.homepage      = "https://github.com/jnunemaker/octolytics"
  spec.license       = "MIT"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler"
end
