# -*- encoding: utf-8 -*-
# stub: github-ds 0.5.4 ruby lib

Gem::Specification.new do |s|
  s.name = "github-ds".freeze
  s.version = "0.5.4".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.org" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub Open Source".freeze, "John Nunemaker".freeze]
  s.bindir = "exe".freeze
  s.date = "2024-03-28"
  s.description = "A collection of libraries for working with SQL on top of ActiveRecord's connection.".freeze
  s.email = ["opensource+github-ds@github.com".freeze, "nunemaker@gmail.com".freeze]
  s.homepage = "https://github.com/github/github-ds".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.5.3".freeze
  s.summary = "A collection of libraries for working with SQL on top of ActiveRecord's connection.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<activerecord>.freeze, [">= 3.2".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 1.14".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<timecop>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<activesupport>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<mysql2>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<mocha>.freeze, [">= 0".freeze])
end
