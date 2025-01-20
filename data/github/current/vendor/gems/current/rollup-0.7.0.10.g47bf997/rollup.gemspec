# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'rollup/version'

Gem::Specification.new do |spec|
  spec.name          = "rollup"
  spec.version       = Rollup::VERSION
  spec.authors       = ["Misty De Meo"]
  spec.email         = ["mistydemeo@github.com"]

  spec.summary       = %q{Generate a unique identifier for an exception}
  spec.description   = %q{Generate a unique identifier for an exception}
  spec.homepage      = "https://github.com/github/rollup"

  spec.files         = `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler"
  spec.add_development_dependency "rake"
  spec.add_development_dependency "minitest"
end
