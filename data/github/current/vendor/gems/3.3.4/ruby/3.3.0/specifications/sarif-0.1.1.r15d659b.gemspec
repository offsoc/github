# -*- encoding: utf-8 -*-
# stub: sarif 0.1.1.r15d659b ruby lib
# stub: ext/sarif/Cargo.toml

Gem::Specification.new do |s|
  s.name = "sarif".freeze
  s.version = "0.1.1.r15d659b".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 3.3.11".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.pkg.github.com/github", "changelog_uri" => "https://github.com/github/sarif-gem", "github_repo" => "ssh://github.com/github/sarif-gem", "homepage_uri" => "https://github.com/github/sarif-gem", "source_code_uri" => "https://github.com/github/sarif-gem" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Simon Engledew".freeze]
  s.bindir = "exe".freeze
  s.date = "2024-08-09"
  s.description = "Extracts information from SARIF documents".freeze
  s.email = ["simon-engledew@github.com".freeze]
  s.extensions = ["ext/sarif/Cargo.toml".freeze]
  s.files = ["ext/sarif/Cargo.toml".freeze]
  s.homepage = "https://github.com/github/sarif-gem".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.6.0".freeze)
  s.rubygems_version = "3.5.11".freeze
  s.summary = "parse, verify and extract SARIF documents".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.21".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.1".freeze])
  s.add_development_dependency(%q<rake-compiler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rb_sys>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<ffi>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<activesupport>.freeze, [">= 0".freeze])
end
