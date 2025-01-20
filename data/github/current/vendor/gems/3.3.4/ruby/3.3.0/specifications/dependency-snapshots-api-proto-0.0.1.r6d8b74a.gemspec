# -*- encoding: utf-8 -*-
# stub: dependency-snapshots-api-proto 0.0.1.r6d8b74a ruby lib

Gem::Specification.new do |s|
  s.name = "dependency-snapshots-api-proto".freeze
  s.version = "0.0.1.r6d8b74a".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub".freeze]
  s.date = "2023-08-04"
  s.homepage = "https://github.com/github/dependency-snapshots-api/tree/main/gen/ruby".freeze
  s.licenses = ["Nonstandard".freeze]
  s.rubygems_version = "3.4.10".freeze
  s.summary = "Generated client code for Dependency Snapshots API.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.1".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
end
