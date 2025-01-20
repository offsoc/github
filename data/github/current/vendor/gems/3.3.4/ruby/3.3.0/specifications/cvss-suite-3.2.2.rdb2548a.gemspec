# -*- encoding: utf-8 -*-
# stub: cvss-suite 3.2.2.rdb2548a ruby lib

Gem::Specification.new do |s|
  s.name = "cvss-suite".freeze
  s.version = "3.2.2.rdb2548a".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "bug_tracker_uri" => "https://github.com/0llirocks/cvss-suite/issues", "changelog_uri" => "https://github.com/0llirocks/cvss-suite/blob/master/CHANGES.md", "documentation_uri" => "https://www.rubydoc.info/gems/cvss-suite/3.2.2", "homepage_uri" => "https://cvss-suite.0lli.rocks", "source_code_uri" => "https://github.com/0llirocks/cvss-suite" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["0llirocks".freeze]
  s.bindir = "exe".freeze
  s.date = "2024-08-19"
  s.description = "This Ruby gem calculates the score based on the vector of the\nCommon Vulnerability Scoring System (https://www.first.org/cvss/specification-document)\nin version 4.0, 3.1, 3.0 and 2.".freeze
  s.homepage = "https://cvss-suite.0lli.rocks".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.6.0".freeze)
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Ruby gem for processing cvss vectors.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<bundler>.freeze, ["= 2.4.22".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.4".freeze])
  s.add_development_dependency(%q<rspec-its>.freeze, ["~> 1.2".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["= 1.50.2".freeze])
  s.add_development_dependency(%q<simplecov>.freeze, ["~> 0.18".freeze])
end
