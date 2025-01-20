# -*- encoding: utf-8 -*-
# stub: json5 0.0.1 ruby lib

Gem::Specification.new do |s|
  s.name = "json5".freeze
  s.version = "0.0.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Bartosz Kopinski".freeze]
  s.date = "2014-03-05"
  s.email = ["bartosz.kopinski@gmail.com".freeze]
  s.homepage = "http://json5.org/".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "2.2.2".freeze
  s.summary = "JSON5 parser in Ruby".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<bundler>.freeze, ["~> 1.5".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<oj>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<therubyracer>.freeze, [">= 0".freeze])
end
