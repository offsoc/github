# -*- encoding: utf-8 -*-
# stub: proto-dependabot-api 0.0.26.ra219bf26d ruby lib

Gem::Specification.new do |s|
  s.name = "proto-dependabot-api".freeze
  s.version = "0.0.26.ra219bf26d".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub".freeze]
  s.date = "2024-08-29"
  s.homepage = "https://github.com/github/dependabot-api/tree/main/gen/ruby".freeze
  s.licenses = ["Nonstandard".freeze]
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Generated client/server code for github/dependabot-api".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.1".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
end
