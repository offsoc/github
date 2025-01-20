# -*- encoding: utf-8 -*-
# stub: licensify-client 0.9.0 ruby lib

Gem::Specification.new do |s|
  s.name = "licensify-client".freeze
  s.version = "0.9.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.pkg.github.com", "github_repo" => "ssh://github.com/github/licensify", "homepage_uri" => "https://github.com/github/licensify" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["#licensing".freeze]
  s.date = "2024-08-07"
  s.homepage = "https://github.com/github/licensify".freeze
  s.required_ruby_version = Gem::Requirement.new(">= 2.6.0".freeze)
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Ruby client for Licensify".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0.17".freeze, "< 3".freeze])
  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.10".freeze])
  s.add_development_dependency(%q<google-protobuf>.freeze, ["~> 3.25.3".freeze])
  s.add_development_dependency(%q<pry>.freeze, ["~> 0.14.2".freeze])
  s.add_development_dependency(%q<rack>.freeze, ["~> 3.0.9".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.1".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.13".freeze])
  s.add_development_dependency(%q<rubocop-github>.freeze, ["~> 0.20".freeze])
  s.add_development_dependency(%q<rubocop-performance>.freeze, ["~> 1.20.2".freeze])
  s.add_development_dependency(%q<rubocop-rake>.freeze, ["~> 0.6".freeze])
  s.add_development_dependency(%q<rubocop-rspec>.freeze, ["~> 2.26".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 3.21.2".freeze])
end
