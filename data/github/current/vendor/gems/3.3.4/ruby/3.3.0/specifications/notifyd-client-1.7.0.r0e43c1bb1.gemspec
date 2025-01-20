# -*- encoding: utf-8 -*-
# stub: notifyd-client 1.7.0.r0e43c1bb1 ruby lib

Gem::Specification.new do |s|
  s.name = "notifyd-client".freeze
  s.version = "1.7.0.r0e43c1bb1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["@github/notifications".freeze]
  s.date = "2024-08-19"
  s.homepage = "https://github.com/github/notifyd".freeze
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Ruby client for notifyd services".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<google-protobuf>.freeze, ["~> 3.14".freeze])
  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.10".freeze])
  s.add_runtime_dependency(%q<resilient>.freeze, ["~> 0.4.0".freeze])
  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0.17".freeze, "< 2".freeze])
  s.add_runtime_dependency(%q<sorbet-runtime>.freeze, [">= 0".freeze])
end
