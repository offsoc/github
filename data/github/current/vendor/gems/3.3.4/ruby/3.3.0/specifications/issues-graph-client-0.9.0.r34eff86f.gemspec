# -*- encoding: utf-8 -*-
# stub: issues-graph-client 0.9.0.r34eff86f ruby ruby/lib

Gem::Specification.new do |s|
  s.name = "issues-graph-client".freeze
  s.version = "0.9.0.r34eff86f".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["ruby/lib".freeze]
  s.authors = ["mattkorwel".freeze, "japf".freeze, "maxbeizer".freeze, "dusave".freeze, "schlubbi".freeze]
  s.date = "2024-04-08"
  s.homepage = "https://github.com/github/issues-graph".freeze
  s.rubygems_version = "3.5.3".freeze
  s.summary = "Ruby client for the issues-graph API".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.8".freeze])
  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<mocha>.freeze, ["~> 1.1.0".freeze])
  s.add_development_dependency(%q<google-protobuf>.freeze, ["~> 3.21".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.14".freeze])
  s.add_development_dependency(%q<minitest-hooks>.freeze, ["~> 1.5".freeze])
  s.add_development_dependency(%q<pry>.freeze, ["~> 0.14".freeze])
  s.add_development_dependency(%q<rack>.freeze, ["~> 3.0".freeze])
  s.add_development_dependency(%q<simplecov>.freeze, ["~> 0.20".freeze])
  s.add_development_dependency(%q<webrick>.freeze, ["~> 1.7".freeze])
  s.add_development_dependency(%q<byebug>.freeze, ["~> 11.1".freeze])
end
