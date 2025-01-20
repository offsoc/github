# -*- encoding: utf-8 -*-
# stub: failbot 3.1.3.17.g7ce2e51 ruby lib

Gem::Specification.new do |s|
  s.name = "failbot".freeze
  s.version = "3.1.3.17.g7ce2e51".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub Observability Team".freeze]
  s.date = "2024-04-25"
  s.description = "...".freeze
  s.email = ["observability@github.com".freeze]
  s.homepage = "http://github.com/github/failbot#readme".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.0".freeze)
  s.rubygems_version = "3.5.9".freeze
  s.summary = "Deliver exceptions to Haystack".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<resilient>.freeze, [">= 0.4".freeze])
  s.add_development_dependency(%q<base64>.freeze, ["~> 0.2".freeze])
  s.add_development_dependency(%q<bigdecimal>.freeze, ["~> 3.1".freeze])
  s.add_development_dependency(%q<rails>.freeze, [">= 6.1".freeze, "< 8.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 10.0".freeze])
  s.add_development_dependency(%q<rack>.freeze, [">= 1.6.4".freeze])
  s.add_development_dependency(%q<rack-test>.freeze, ["~> 0.6".freeze])
  s.add_development_dependency(%q<m>.freeze, ["~> 1.6".freeze])
  s.add_development_dependency(%q<minitest>.freeze, [">= 5.0".freeze])
  s.add_development_dependency(%q<minitest-stub-const>.freeze, [">= 0.6".freeze])
  s.add_development_dependency(%q<mocha>.freeze, [">= 1.13.0".freeze])
  s.add_development_dependency(%q<mutex_m>.freeze, ["~> 0.2".freeze])
  s.add_development_dependency(%q<webmock>.freeze, [">= 3.0".freeze])
  s.add_development_dependency(%q<pry>.freeze, ["~> 0.14".freeze])
  s.add_development_dependency(%q<solargraph>.freeze, ["~> 0.50".freeze])
  s.add_development_dependency(%q<ruby-lsp>.freeze, ["~> 0.13".freeze])
end
