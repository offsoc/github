# -*- encoding: utf-8 -*-
# stub: geo_pattern 1.5.0 ruby lib

Gem::Specification.new do |s|
  s.name = "geo_pattern".freeze
  s.version = "1.5.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Jason Long".freeze]
  s.date = "2023-04-05"
  s.description = "Generate SVG beautiful patterns".freeze
  s.email = ["jason@jasonlong.me".freeze]
  s.homepage = "https://github.com/jasonlong/geo_pattern".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.6".freeze)
  s.rubygems_version = "3.0.3.1".freeze
  s.summary = "Generate SVG beautiful patterns".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<color>.freeze, ["~> 1.5".freeze])
  s.add_development_dependency(%q<bundler>.freeze, ["~> 2.2".freeze])
end
