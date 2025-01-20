# -*- encoding: utf-8 -*-
# stub: aleph-client 16.1.0.r8839e09aa ruby ruby/lib

Gem::Specification.new do |s|
  s.name = "aleph-client".freeze
  s.version = "16.1.0.r8839e09aa".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "TODO: Set to 'http://mygemserver.com'" } if s.respond_to? :metadata=
  s.require_paths = ["ruby/lib".freeze]
  s.authors = ["Timothy Clem".freeze]
  s.date = "2023-12-13"
  s.description = "Aleph is an RPC service that provides code navigation services.".freeze
  s.email = ["timothy.clem@gmail.com".freeze]
  s.homepage = "https://github.com/github/aleph-client-ruby".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.4.10".freeze
  s.summary = "Twirp Client for Aleph.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<google-protobuf>.freeze, ["~> 3.14".freeze])
  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.1".freeze])
  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0.17.3".freeze, "<= 2.3.0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, ["~> 2.4.3".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.8".freeze])
  s.add_development_dependency(%q<vcr>.freeze, ["~> 6.1".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 3.8".freeze])
end
