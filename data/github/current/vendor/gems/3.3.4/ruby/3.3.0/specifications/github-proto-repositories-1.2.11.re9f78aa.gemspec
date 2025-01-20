# -*- encoding: utf-8 -*-
# stub: github-proto-repositories 1.2.11.re9f78aa ruby lib

Gem::Specification.new do |s|
  s.name = "github-proto-repositories".freeze
  s.version = "1.2.11.re9f78aa".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub".freeze]
  s.date = "2020-07-07"
  s.homepage = "https://github.com/github/github-proto/tree/master/gen/ruby/repositories".freeze
  s.licenses = ["Nonstandard".freeze]
  s.rubygems_version = "3.0.3".freeze
  s.summary = "Generated client/server code for github/github repositories data.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.1".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
end
