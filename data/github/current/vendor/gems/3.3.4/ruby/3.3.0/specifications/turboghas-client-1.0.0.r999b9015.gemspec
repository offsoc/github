# -*- encoding: utf-8 -*-
# stub: turboghas-client 1.0.0.r999b9015 ruby ruby/lib

Gem::Specification.new do |s|
  s.name = "turboghas-client".freeze
  s.version = "1.0.0.r999b9015".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.pkg.github.com/github", "github_repo" => "ssh://github.com/github/turboghas" } if s.respond_to? :metadata=
  s.require_paths = ["ruby/lib".freeze]
  s.authors = ["Simon Engledew".freeze]
  s.date = "2024-03-25"
  s.email = ["simon-engledew@github.com".freeze]
  s.homepage = "https://github.com/github/turboghas".freeze
  s.rubygems_version = "3.5.3".freeze
  s.summary = "Twirp client for turboghas".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<google-protobuf>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<twirp>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<monolith-twirp-code_scanning-turboghas>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<vcr>.freeze, ["~> 5.1".freeze])
end
