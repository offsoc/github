# -*- encoding: utf-8 -*-
# stub: blackbird-query 0.2.0.r31fb5b7bc ruby lib

Gem::Specification.new do |s|
  s.name = "blackbird-query".freeze
  s.version = "0.2.0.r31fb5b7bc".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["The blackbird team <support@github.com>".freeze]
  s.date = "2024-02-22"
  s.homepage = "https://github.com/github/blackbird".freeze
  s.rubygems_version = "3.5.3".freeze
  s.summary = "Ruby client for the blackbird query service".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.10".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rack>.freeze, [">= 0".freeze])
end
