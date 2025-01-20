# -*- encoding: utf-8 -*-
# stub: erblint-github 1.0.1 ruby lib

Gem::Specification.new do |s|
  s.name = "erblint-github".freeze
  s.version = "1.0.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "rubygems_mfa_required" => "true" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub Open Source".freeze]
  s.date = "2024-02-08"
  s.description = "Template style checking for GitHub Ruby repositories".freeze
  s.email = ["opensource+erblint-github@github.com".freeze]
  s.executables = ["erblint-disable".freeze]
  s.files = ["bin/erblint-disable".freeze]
  s.homepage = "https://github.com/github/erblint-github".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.0.0".freeze)
  s.rubygems_version = "3.4.10".freeze
  s.summary = "erblint GitHub".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<erb_lint>.freeze, ["~> 0.5.0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.21.1".freeze])
  s.add_development_dependency(%q<mocha>.freeze, ["~> 2.1.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.1.0".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["= 1.60.2".freeze])
  s.add_development_dependency(%q<rubocop-github>.freeze, ["~> 0.20.0".freeze])
end
