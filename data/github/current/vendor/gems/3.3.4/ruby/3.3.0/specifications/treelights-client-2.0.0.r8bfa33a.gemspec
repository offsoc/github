# -*- encoding: utf-8 -*-
# stub: treelights-client 2.0.0.r8bfa33a ruby ruby/lib

Gem::Specification.new do |s|
  s.name = "treelights-client".freeze
  s.version = "2.0.0.r8bfa33a".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "TODO: Set to 'http://mygemserver.com'" } if s.respond_to? :metadata=
  s.require_paths = ["ruby/lib".freeze]
  s.authors = ["Max Brunsfeld, Timothy Clem, Vicent Marti".freeze]
  s.date = "2024-04-22"
  s.description = "Treelights is an RPC service that performs syntax highlighting for source code.".freeze
  s.email = ["maxbrunsfeld@gmail.com, timothy.clem@gmail.com, vmg@github.com".freeze]
  s.homepage = "https://github.com/github/treelights-client-ruby".freeze
  s.rubygems_version = "3.5.3".freeze
  s.summary = "Twirp Client for Treelights.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<google-protobuf>.freeze, ["~> 3.5".freeze])
  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.1".freeze])
  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0.9".freeze])
  s.add_development_dependency(%q<rack>.freeze, ["~> 3.0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, ["~> 2.4".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.8".freeze])
  s.add_development_dependency(%q<vcr>.freeze, ["~> 6.0".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 3.5".freeze])
end
