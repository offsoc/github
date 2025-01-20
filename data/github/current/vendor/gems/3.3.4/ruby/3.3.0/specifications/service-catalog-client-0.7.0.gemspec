# -*- encoding: utf-8 -*-
# stub: service-catalog-client 0.7.0 ruby lib

Gem::Specification.new do |s|
  s.name = "service-catalog-client".freeze
  s.version = "0.7.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://octofactory.githubapp.com/artifactory/api/gems/cat-gems-releases-local", "changelog_uri" => "https://github.com/github/cat/blob/HEAD/service-catalog-client/CHANGELOG.md", "homepage_uri" => "https://github.com/github/cat", "source_code_uri" => "https://github.com/github/cat/tree/HEAD/service-catalog-client" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Parker Moore".freeze]
  s.bindir = "exe".freeze
  s.date = "2020-09-02"
  s.email = ["opensource@github.com".freeze]
  s.homepage = "https://github.com/github/cat".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.1.2".freeze
  s.summary = "A Ruby client for communicating with the Service Catalog API.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<activesupport>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<graphql>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.0".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 3.8".freeze])
  s.add_development_dependency(%q<yard>.freeze, ["~> 0.9.0".freeze])
end
