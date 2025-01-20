# -*- encoding: utf-8 -*-
# stub: resilient 0.4.0 ruby lib

Gem::Specification.new do |s|
  s.name = "resilient".freeze
  s.version = "0.4.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["John Nunemaker".freeze]
  s.bindir = "exe".freeze
  s.date = "2016-04-15"
  s.email = ["nunemaker@gmail.com".freeze]
  s.homepage = "https://github.com/jnunemaker/resilient".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "2.4.5.1".freeze
  s.summary = "toolkit for resilient ruby apps".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<bundler>.freeze, ["~> 1.10".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.8".freeze])
  s.add_development_dependency(%q<timecop>.freeze, ["~> 0.8.0".freeze])
end
