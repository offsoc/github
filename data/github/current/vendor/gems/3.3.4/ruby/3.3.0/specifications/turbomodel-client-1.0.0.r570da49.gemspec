# -*- encoding: utf-8 -*-
# stub: turbomodel-client 1.0.0.r570da49 ruby ruby/lib

Gem::Specification.new do |s|
  s.name = "turbomodel-client".freeze
  s.version = "1.0.0.r570da49".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.pkg.github.com/github", "github_repo" => "ssh://github.com/github/turbomodel" } if s.respond_to? :metadata=
  s.require_paths = ["ruby/lib".freeze]
  s.authors = ["Koen Vlaswinkel".freeze]
  s.date = "2023-08-11"
  s.email = ["koesie10@github.com".freeze]
  s.homepage = "https://github.com/github/turbomodel".freeze
  s.rubygems_version = "3.4.10".freeze
  s.summary = "Twirp client for turbomodel".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<google-protobuf>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<twirp>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0".freeze])
end
