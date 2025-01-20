# -*- encoding: utf-8 -*-
# stub: elastomer-client 6.1.1 ruby lib

Gem::Specification.new do |s|
  s.name = "elastomer-client".freeze
  s.version = "6.1.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Tim Pease".freeze, "Grant Rodgers".freeze]
  s.date = "2024-06-05"
  s.description = "ElastomerClient is a low level API client for the\n                          Elasticsearch HTTP interface.".freeze
  s.email = ["tim.pease@github.com".freeze, "grant.rodgers@github.com".freeze]
  s.homepage = "https://github.com/github/elastomer-client".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.5.9".freeze
  s.summary = "A library for interacting with Elasticsearch".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<addressable>.freeze, ["~> 2.5".freeze])
  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0.17".freeze])
  s.add_runtime_dependency(%q<faraday_middleware>.freeze, [">= 0.14".freeze])
  s.add_runtime_dependency(%q<multi_json>.freeze, ["~> 1.12".freeze])
  s.add_runtime_dependency(%q<semantic>.freeze, ["~> 1.6".freeze])
end
