# -*- encoding: utf-8 -*-
# stub: vexi_management 0.1.5 ruby lib

Gem::Specification.new do |s|
  s.name = "vexi_management".freeze
  s.version = "0.1.5".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "github_repo" => "ssh://github.com/github/feature-management-client-ruby" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["github/feature-management".freeze]
  s.date = "2024-02-06"
  s.description = "Vexi is short for \"vexillology\" which is the study of flags.".freeze
  s.homepage = "http://www.github.com/github/feature-management-client-ruby".freeze
  s.licenses = ["Nonstandard".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.0.0".freeze)
  s.rubygems_version = "3.5.3".freeze
  s.summary = "Vexi Management is a Ruby Client for feature flag management operations".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<sorbet-runtime>.freeze, ["~> 0.5".freeze])
  s.add_runtime_dependency(%q<vexi>.freeze, [">= 0".freeze])
end
