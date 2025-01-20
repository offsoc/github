# -*- encoding: utf-8 -*-
# stub: sprockets-helpers 1.4.0 ruby lib

Gem::Specification.new do |s|
  s.name = "sprockets-helpers".freeze
  s.version = "1.4.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Pete Browne".freeze]
  s.date = "2020-08-31"
  s.description = "Asset path helpers for Sprockets 2.x & 3.x applications".freeze
  s.email = ["me@petebrowne.com".freeze]
  s.homepage = "https://github.com/petebrowne/sprockets-helpers".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.4.10".freeze
  s.summary = "Asset path helpers for Sprockets 2.x & 3.x applications".freeze

  s.installed_by_version = "3.4.10" if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<sprockets>.freeze, [">= 2.2"])
  s.add_development_dependency(%q<appraisal>.freeze, ["~> 2.0"])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.3"])
  s.add_development_dependency(%q<test_construct>.freeze, ["~> 2.0"])
  s.add_development_dependency(%q<sinatra>.freeze, ["~> 1.4"])
  s.add_development_dependency(%q<rake>.freeze, [">= 0"])
end
