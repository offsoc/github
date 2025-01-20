# -*- encoding: utf-8 -*-
# stub: monolith-twirp-conduit-feeds 1.8.6 ruby lib

Gem::Specification.new do |s|
  s.name = "monolith-twirp-conduit-feeds".freeze
  s.version = "1.8.6".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "github_repo" => "https://github.com/github/conduit" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub".freeze]
  s.date = "2023-10-16"
  s.homepage = "https://github.com/github/conduit".freeze
  s.licenses = ["Nonstandard".freeze]
  s.rubygems_version = "3.0.3".freeze
  s.summary = "Generated client/server code for github/github feeds data.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.1".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
end
