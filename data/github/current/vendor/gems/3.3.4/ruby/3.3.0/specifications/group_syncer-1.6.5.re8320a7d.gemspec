# -*- encoding: utf-8 -*-
# stub: group_syncer 1.6.5.re8320a7d ruby lib

Gem::Specification.new do |s|
  s.name = "group_syncer".freeze
  s.version = "1.6.5.re8320a7d".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["arielvalentin".freeze, "wallace".freeze, "chesterbr".freeze, "hmasila".freeze]
  s.date = "2021-03-22"
  s.homepage = "https://github.com/github/group-syncer".freeze
  s.rubygems_version = "3.0.3".freeze
  s.summary = "A Ruby client for the Group Syncer service".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.1".freeze])
end
