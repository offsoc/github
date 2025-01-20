# -*- encoding: utf-8 -*-
# stub: sourcemap 0.1.1 ruby lib

Gem::Specification.new do |s|
  s.name = "sourcemap".freeze
  s.version = "0.1.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Josh Peek".freeze, "Alex MacCaw".freeze]
  s.date = "2014-10-02"
  s.description = "Ruby source maps".freeze
  s.email = ["alex@alexmaccaw.com".freeze]
  s.homepage = "http://github.com/maccman/sourcemap".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "2.2.2".freeze
  s.summary = "Ruby source maps".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<bundler>.freeze, ["~> 1.3".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, [">= 0".freeze])
end
