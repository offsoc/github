# -*- encoding: utf-8 -*-
# stub: secret-scanning-proto 0.0.1.r168781f ruby lib

Gem::Specification.new do |s|
  s.name = "secret-scanning-proto".freeze
  s.version = "0.0.1.r168781f".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub".freeze]
  s.date = "2024-08-29"
  s.homepage = "https://github.com/github/secret-scanning-proto/tree/master/gen/ruby".freeze
  s.licenses = ["Nonstandard".freeze]
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Generated client/server code for Token Scanning Service API.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0.15.4".freeze])
  s.add_runtime_dependency(%q<google-protobuf>.freeze, ["~> 3.9".freeze])
  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.1".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.9".freeze])
  s.add_development_dependency(%q<vcr>.freeze, ["~> 5.1".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 3.14".freeze])
end
