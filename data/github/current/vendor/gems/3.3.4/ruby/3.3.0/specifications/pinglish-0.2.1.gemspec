# -*- encoding: utf-8 -*-
# stub: pinglish 0.2.1 ruby lib

Gem::Specification.new do |s|
  s.name = "pinglish".freeze
  s.version = "0.2.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["John Barnette".freeze, "Will Farrington".freeze]
  s.date = "2014-11-13"
  s.description = "A simple Rack middleware for checking app health.".freeze
  s.email = ["jbarnette@github.com".freeze, "wfarr@github.com".freeze]
  s.homepage = "https://github.com/jbarnette/pinglish".freeze
  s.rubygems_version = "2.2.2".freeze
  s.summary = "/_ping your way to freedom.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<rack>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 4.5".freeze])
  s.add_development_dependency(%q<rack-test>.freeze, ["~> 0.6".freeze])
end
