# -*- encoding: utf-8 -*-

if ENV['DEVELOPMENT']
  VERSION = `git describe --tags`.strip.gsub('-', '.')
else
  VERSION = "0.6.0"
end

Gem::Specification.new do |s|
  s.name        = "gitrpc"
  s.version     = VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = %w[@rtomayko @brianmario]
  s.email       = ["rtomayko@github.com"]
  s.homepage    = "https://github.com/github/gitrpc#readme"
  s.summary     = "network optimized git access"
  s.description = "..."

  s.required_rubygems_version = ">= 1.3.6"

  s.add_runtime_dependency "charlock_holmes", "~> 0.7.6"
  s.add_runtime_dependency "bert",            "~> 1.1.6"
  s.add_runtime_dependency "editorconfig",    "~> 0.1"
  s.add_runtime_dependency "progeny",         "~> 0.2.0"
  # Rugged has a >= dependency due to the version numbers following
  # libgit2. The minor revision frequently changes even between betas.
  s.add_runtime_dependency "rugged",          ">= 1.4.3.102.ga6b7142"
  s.add_runtime_dependency "licensee",        "~> 9.15"
  s.add_runtime_dependency "msgpack",         "~> 1.0"
  s.add_runtime_dependency "iopromise",       "~> 0.1.1"
  s.add_runtime_dependency "scientist",       "1.6.4"

  s.add_development_dependency "bertrpc",  "~> 1.3.1"

  s.add_development_dependency "rake"
  s.add_development_dependency "minitest"
  s.add_development_dependency "simplecov"

  s.files         = `git ls-files -- lib bin gitrpc.gemspec`.split("\n")
  s.executables   = `git ls-files -- bin`.split("\n").map { |f| File.basename(f) }
  s.require_paths = %w[lib]
end
