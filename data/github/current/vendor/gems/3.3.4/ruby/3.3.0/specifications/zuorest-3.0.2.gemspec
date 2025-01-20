# -*- encoding: utf-8 -*-
# stub: zuorest 3.0.2 ruby lib

Gem::Specification.new do |s|
  s.name = "zuorest".freeze
  s.version = "3.0.2".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.pkg.github.com" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Jesse Wolfe!".freeze]
  s.bindir = "exe".freeze
  s.date = "2024-08-21"
  s.email = ["jes5199@github.com".freeze]
  s.homepage = "https://github.com/github/zuorest".freeze
  s.rubygems_version = "3.5.11".freeze
  s.summary = "A lightweight client for Zuora's REST API".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<activesupport>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<faraday_middleware>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<oauth2>.freeze, [">= 1.4".freeze])
  s.add_development_dependency(%q<bundler>.freeze, ["~> 2.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 12.3.3".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.14.4".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 3.6.0".freeze])
  s.add_development_dependency(%q<mocha>.freeze, ["~> 2.0.0".freeze])
end
