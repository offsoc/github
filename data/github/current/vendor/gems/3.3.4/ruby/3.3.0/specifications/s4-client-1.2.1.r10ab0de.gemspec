# -*- encoding: utf-8 -*-
# stub: s4-client 1.2.1.r10ab0de ruby client/ruby/lib

Gem::Specification.new do |s|
  s.name = "s4-client".freeze
  s.version = "1.2.1.r10ab0de".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "none", "homepage_uri" => "https://github.com/github/s4", "source_code_uri" => "https://github.com/github/s4" } if s.respond_to? :metadata=
  s.require_paths = ["client/ruby/lib".freeze]
  s.authors = ["Sergio Rubio".freeze]
  s.bindir = "exe".freeze
  s.date = "2024-04-10"
  s.email = ["rubiojr@github.com".freeze]
  s.homepage = "https://github.com/github/s4".freeze
  s.rubygems_version = "3.5.3".freeze
  s.summary = "Ruby client for S4".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0.9".freeze])
  s.add_runtime_dependency(%q<twirp>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<google-protobuf>.freeze, ["< 4.0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.0".freeze])
  s.add_development_dependency(%q<rubocop-github>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<mocha>.freeze, ["~> 1.8".freeze])
  s.add_development_dependency(%q<pry>.freeze, ["~> 0.12.2".freeze])
  s.add_development_dependency(%q<activesupport>.freeze, ["~> 7.0.4".freeze])
  s.add_development_dependency(%q<mongo>.freeze, ["~> 2.16.0".freeze])
end
