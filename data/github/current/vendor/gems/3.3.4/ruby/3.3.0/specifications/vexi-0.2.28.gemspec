# -*- encoding: utf-8 -*-
# stub: vexi 0.2.28 ruby lib

Gem::Specification.new do |s|
  s.name = "vexi".freeze
  s.version = "0.2.28".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "github_repo" => "ssh://github.com/github/feature-management-client-ruby" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["github/feature-management".freeze]
  s.date = "2022-01-01"
  s.description = "Vexi is short for \"vexillology\" which is the study of flags.".freeze
  s.executables = ["vexi".freeze]
  s.files = ["bin/vexi".freeze]
  s.homepage = "http://www.github.com/github/feature-management-client-ruby".freeze
  s.licenses = ["Nonstandard".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.0.0".freeze)
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Vexi is a Ruby Client for feature flag checks".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<activesupport>.freeze, [">= 7.0".freeze])
  s.add_runtime_dependency(%q<feature_management_feature_flags>.freeze, [">= 1.6".freeze, "< 1.8".freeze])
  s.add_runtime_dependency(%q<fnv>.freeze, ["= 0.2.0".freeze])
  s.add_runtime_dependency(%q<sorbet-runtime>.freeze, ["~> 0.5".freeze])
  s.add_runtime_dependency(%q<zache>.freeze, ["= 0.13.2".freeze])
end
