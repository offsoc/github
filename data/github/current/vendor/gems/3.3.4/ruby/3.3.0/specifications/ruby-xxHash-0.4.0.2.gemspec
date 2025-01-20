# -*- encoding: utf-8 -*-
# stub: ruby-xxHash 0.4.0.2 ruby lib

Gem::Specification.new do |s|
  s.name = "ruby-xxHash".freeze
  s.version = "0.4.0.2".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Justin W Smith".freeze]
  s.date = "2022-02-01"
  s.description = "A pure Ruby implementation of xxhash.".freeze
  s.email = ["justin.w.smith@gmail.com".freeze]
  s.homepage = "https://github.com/justinwsmith/ruby-xxhash".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.2.32".freeze
  s.summary = "A pure Ruby implementation of xxhash.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, [">= 0".freeze])
end
