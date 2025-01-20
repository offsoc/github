# -*- encoding: utf-8 -*-
# stub: proto-trust-metadata-api 0.11.0.r3f3e5570 ruby lib

Gem::Specification.new do |s|
  s.name = "proto-trust-metadata-api".freeze
  s.version = "0.11.0.r3f3e5570".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "homepage_uri" => "https://github.com/github/trust-metadata-api", "source_code_uri" => "https://github.com/github/trust-metadata-api" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Package Security".freeze]
  s.date = "2024-05-24"
  s.description = "Trust Metadata API Ruby client".freeze
  s.email = ["package-security@github.com".freeze]
  s.homepage = "https://github.com/github/trust-metadata-api".freeze
  s.required_ruby_version = Gem::Requirement.new(">= 2.6.0".freeze)
  s.rubygems_version = "3.5.9".freeze
  s.summary = "Trust Metadata API Ruby client".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.1".freeze])
  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0.17".freeze])
  s.add_runtime_dependency(%q<sorbet-runtime>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, ["~> 2.4".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.18".freeze])
  s.add_development_dependency(%q<pry>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rack>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<vcr>.freeze, ["~> 6.2".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 3.9".freeze])
  s.add_development_dependency(%q<sorbet>.freeze, [">= 0".freeze])
end
