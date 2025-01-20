# -*- encoding: utf-8 -*-
# stub: billing-platform-client 0.40.0 ruby ruby/lib

Gem::Specification.new do |s|
  s.name = "billing-platform-client".freeze
  s.version = "0.40.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["ruby/lib".freeze]
  s.authors = ["#billing-engineering".freeze]
  s.date = "2024-08-01"
  s.homepage = "https://github.com/github/billing-platform".freeze
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Ruby client for the billing-platform API".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0.17".freeze, "< 3".freeze])
  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.10".freeze])
  s.add_development_dependency(%q<google-protobuf>.freeze, ["~> 3.21".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.12".freeze])
  s.add_development_dependency(%q<rack>.freeze, ["~> 2.2".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 3.18".freeze])
  s.add_development_dependency(%q<simplecov>.freeze, ["~> 0.21.0".freeze])
end
