# -*- encoding: utf-8 -*-

Gem::Specification.new do |gem|
  gem.name          = "egress"
  gem.version       = "2"
  gem.authors       = ["github/ecosystem-apps"]
  gem.email         = ["ohshit@github.com"]
  gem.description   = "A DSL for managing authorization with an OAuth flavor."
  gem.summary       = "Role definition and access control."
  gem.homepage      = "https://github.com/github/egress"

  gem.files         = `git ls-files`.split $/
  gem.test_files    = gem.files.grep(/^test/)
  gem.require_paths = ["lib"]

  gem.add_development_dependency "minitest"
  gem.add_development_dependency "rake"
end
