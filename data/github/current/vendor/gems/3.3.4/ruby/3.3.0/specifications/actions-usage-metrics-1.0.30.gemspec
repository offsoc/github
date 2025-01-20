# -*- encoding: utf-8 -*-
# stub: actions-usage-metrics 1.0.30 ruby ruby/lib

Gem::Specification.new do |s|
  s.name = "actions-usage-metrics".freeze
  s.version = "1.0.30".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["ruby/lib".freeze]
  s.authors = ["#actions-fusion".freeze]
  s.date = "2024-08-21"
  s.homepage = "https://github.com/github/actions-usage-metrics".freeze
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Ruby client for actions-usage-metrics".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0.17".freeze, "< 3".freeze])
  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.10".freeze])
  s.add_development_dependency(%q<google-protobuf>.freeze, ["~> 3.21".freeze])
  s.add_development_dependency(%q<rack>.freeze, ["~> 3.0".freeze])
end
