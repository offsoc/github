# -*- encoding: utf-8 -*-
# stub: aqueduct-client 1.1.0 ruby lib

Gem::Specification.new do |s|
  s.name = "aqueduct-client".freeze
  s.version = "1.1.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.pkg.github.com/github", "changelog_uri" => "https://github.com/github/aqueduct-client-ruby", "github_repo" => "ssh://github.com/github/aqueduct-client-ruby", "homepage_uri" => "https://github.com/github/aqueduct-client-ruby", "source_code_uri" => "https://github.com/github/aqueduct-client-ruby" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["@github/data-pipelines".freeze]
  s.bindir = "exe".freeze
  s.date = "2023-07-05"
  s.homepage = "https://github.com/github/aqueduct-client-ruby".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.4.10".freeze
  s.summary = "An aqueduct client for ruby".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<google-protobuf>.freeze, ["~> 3.12".freeze])
  s.add_runtime_dependency(%q<twirp>.freeze, [">= 1.1".freeze])
  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<nanoid>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, ["~> 2".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.0".freeze])
  s.add_development_dependency(%q<rack>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<webrick>.freeze, [">= 0".freeze])
end
