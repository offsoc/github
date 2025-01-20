# -*- encoding: utf-8 -*-
# stub: promise.rb 0.7.4 ruby lib

Gem::Specification.new do |s|
  s.name = "promise.rb".freeze
  s.version = "0.7.4".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Lars Gierth".freeze]
  s.date = "2017-08-25"
  s.description = "Promises/A+ for Ruby".freeze
  s.email = ["lars.gierth@gmail.com".freeze]
  s.homepage = "https://github.com/lgierth/promise".freeze
  s.licenses = ["Public Domain".freeze]
  s.rubygems_version = "2.6.10".freeze
  s.summary = "Ruby implementation of the Promises/A+ spec".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rspec>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<benchmark-ips>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<benchmark-memory>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<memory_profiler>.freeze, [">= 0".freeze])
end
