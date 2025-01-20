# -*- encoding: utf-8 -*-
# stub: blackbird-client 0.1.1.r08d69d9e0 ruby lib

Gem::Specification.new do |s|
  s.name = "blackbird-client".freeze
  s.version = "0.1.1.r08d69d9e0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Michelle Lemons".freeze]
  s.date = "2024-08-27"
  s.homepage = "https://github.com/github/blackbird-mw".freeze
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Ruby client for blackbird service".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.1".freeze])
  s.add_runtime_dependency(%q<google-protobuf>.freeze, ["~> 3.14".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, [">= 0".freeze])
end
