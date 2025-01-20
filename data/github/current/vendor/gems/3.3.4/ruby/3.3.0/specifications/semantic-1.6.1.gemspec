# -*- encoding: utf-8 -*-
# stub: semantic 1.6.1 ruby lib

Gem::Specification.new do |s|
  s.name = "semantic".freeze
  s.version = "1.6.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Josh Lindsey".freeze]
  s.date = "2018-02-14"
  s.description = "Semantic Version utility class for parsing, storing, and comparing versions. See: http://semver.org".freeze
  s.email = ["joshua.s.lindsey@gmail.com".freeze]
  s.homepage = "https://github.com/jlindsey/semantic".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "2.6.13".freeze
  s.summary = "Semantic Version utility class".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rake>.freeze, ["~> 11".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3".freeze])
end
