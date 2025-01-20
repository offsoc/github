# -*- encoding: utf-8 -*-
# stub: meuse-client 1.16.0 ruby lib

Gem::Specification.new do |s|
  s.name = "meuse-client".freeze
  s.version = "1.16.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.pkg.github.com", "github_repo" => "ssh://github.com/github/meuse" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Shawn Aukstakalnis".freeze]
  s.date = "2023-04-19"
  s.email = ["ShawnAukstak@github.com".freeze]
  s.homepage = "https://github.com/github/meuse".freeze
  s.rubygems_version = "3.4.10".freeze
  s.summary = "Twirp client for Meuse".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<activesupport>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0.17".freeze, "< 3".freeze])
  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.1".freeze])
end
