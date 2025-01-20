# -*- encoding: utf-8 -*-
# stub: dependency-graph-platform-proto 0.0.3.rb29e2aa ruby gen/ruby/lib

Gem::Specification.new do |s|
  s.name = "dependency-graph-platform-proto".freeze
  s.version = "0.0.3.rb29e2aa".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["gen/ruby/lib".freeze]
  s.authors = ["GitHub".freeze]
  s.date = "2024-08-28"
  s.homepage = "https://github.com/github/dependency-graph-platform-proto".freeze
  s.licenses = ["Nonstandard".freeze]
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Generated Twirp client code for Dependency Graph Platform service.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.7".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.2".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
end
