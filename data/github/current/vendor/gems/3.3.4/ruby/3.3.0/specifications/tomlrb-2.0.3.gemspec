# -*- encoding: utf-8 -*-
# stub: tomlrb 2.0.3 ruby lib

Gem::Specification.new do |s|
  s.name = "tomlrb".freeze
  s.version = "2.0.3".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Francois Bernier".freeze]
  s.date = "2022-05-28"
  s.description = "A racc based toml parser".freeze
  s.email = ["frankbernier@gmail.com".freeze]
  s.homepage = "https://github.com/fbernier/tomlrb".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.0".freeze)
  s.rubygems_version = "3.3.7".freeze
  s.summary = "A racc based toml parser".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<psych>.freeze, ["~> 4".freeze])
end
