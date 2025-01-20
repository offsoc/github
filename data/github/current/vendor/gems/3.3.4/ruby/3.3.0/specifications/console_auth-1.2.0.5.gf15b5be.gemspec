# -*- encoding: utf-8 -*-
# stub: console_auth 1.2.0.5.gf15b5be ruby lib

Gem::Specification.new do |s|
  s.name = "console_auth".freeze
  s.version = "1.2.0.5.gf15b5be".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.pkg.github.com", "changelog_uri" => "https://github.com/github/console_auth/CHANGELOG.md", "homepage_uri" => "https://github.com/github/console_auth", "source_code_uri" => "https://github.com/github/console_auth" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub, Inc.".freeze]
  s.bindir = "exe".freeze
  s.date = "2024-03-06"
  s.email = ["security@github.com".freeze]
  s.homepage = "https://github.com/github/console_auth".freeze
  s.required_ruby_version = Gem::Requirement.new(">= 2.4.0".freeze)
  s.rubygems_version = "3.5.3".freeze
  s.summary = "Production console access control and logging".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<failbot>.freeze, [">= 2.0".freeze, "< 4".freeze])
  s.add_runtime_dependency(%q<fido-challenger-client>.freeze, ["~> 0.5".freeze])
  s.add_development_dependency(%q<pry>.freeze, ["~> 0.14".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.0".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["~> 1.7".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 2.3".freeze])
end
