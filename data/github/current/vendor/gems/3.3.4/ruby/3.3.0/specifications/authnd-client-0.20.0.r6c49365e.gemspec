# -*- encoding: utf-8 -*-
# stub: authnd-client 0.20.0.r6c49365e ruby ruby/lib

Gem::Specification.new do |s|
  s.name = "authnd-client".freeze
  s.version = "0.20.0.r6c49365e".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["ruby/lib".freeze]
  s.authors = ["davecheney".freeze, "fatih".freeze, "sbryant".freeze, "dbussink".freeze, "shawnfeldman".freeze, "anurse".freeze, "jphenow".freeze]
  s.date = "2024-06-13"
  s.homepage = "https://github.com/github/authnd".freeze
  s.licenses = ["Nonstandard".freeze]
  s.rubygems_version = "3.5.9".freeze
  s.summary = "Ruby client for authnd services".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.1".freeze])
  s.add_runtime_dependency(%q<resilient>.freeze, ["~> 0.4".freeze])
  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0".freeze])
end
