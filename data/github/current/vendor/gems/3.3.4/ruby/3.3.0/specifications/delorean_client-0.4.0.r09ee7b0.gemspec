# -*- encoding: utf-8 -*-
# stub: delorean_client 0.4.0.r09ee7b0 ruby lib

Gem::Specification.new do |s|
  s.name = "delorean_client".freeze
  s.version = "0.4.0.r09ee7b0".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["BlakeWilliams".freeze, "iancanderson".freeze, "itsbagpack".freeze]
  s.date = "2022-12-01"
  s.homepage = "https://github.com/github/delorean-ruby-client".freeze
  s.rubygems_version = "3.3.7".freeze
  s.summary = "Ruby client for DeLorean".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<webmock>.freeze, [">= 0".freeze])
end
