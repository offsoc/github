# -*- encoding: utf-8 -*-
# stub: nanoid 2.0.0 ruby lib

Gem::Specification.new do |s|
  s.name = "nanoid".freeze
  s.version = "2.0.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Radovan Smitala".freeze]
  s.date = "2018-11-07"
  s.homepage = "https://github.com/radeno/nanoid.rb".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.0".freeze)
  s.rubygems_version = "2.7.7".freeze
  s.summary = "Ruby implementation of Nanoid, secure URL-friendly unique ID generator".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<benchmark-ips>.freeze, [">= 2.7".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 1.15".freeze])
  s.add_development_dependency(%q<minitest>.freeze, [">= 5.10".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 12.0".freeze])
  s.add_development_dependency(%q<reek>.freeze, [">= 5.0".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, [">= 0.5".freeze])
end
