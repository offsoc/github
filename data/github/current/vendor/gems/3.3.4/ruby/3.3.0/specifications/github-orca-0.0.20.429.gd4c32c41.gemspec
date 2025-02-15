# -*- encoding: utf-8 -*-
# stub: github-orca 0.0.20.429.gd4c32c41 ruby api/v1 lib

Gem::Specification.new do |s|
  s.name = "github-orca".freeze
  s.version = "0.0.20.429.gd4c32c41".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["api/v1".freeze, "lib".freeze]
  s.authors = ["GitHub".freeze]
  s.date = "2024-08-01"
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Ruby client for the Orca API".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.1".freeze])
end
