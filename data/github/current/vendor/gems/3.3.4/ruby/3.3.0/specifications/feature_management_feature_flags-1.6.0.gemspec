# -*- encoding: utf-8 -*-
# stub: feature_management_feature_flags 1.6.0 ruby lib

Gem::Specification.new do |s|
  s.name = "feature_management_feature_flags".freeze
  s.version = "1.6.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "github_repo" => "ssh://github.com/github/feature-management-protos" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["github/feature-management".freeze]
  s.date = "2024-07-24"
  s.homepage = "https://github.com/github/feature-management-protos".freeze
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Ruby client for performing feature flags enabled checks".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.10".freeze])
end
