# -*- encoding: utf-8 -*-
# stub: presto-client 0.6.3.r0b63000 ruby lib

Gem::Specification.new do |s|
  s.name = "presto-client".freeze
  s.version = "0.6.3.r0b63000".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Sadayuki Furuhashi".freeze]
  s.date = "2024-07-10"
  s.description = "Presto client library".freeze
  s.email = ["sf@treasure-data.com".freeze]
  s.homepage = "https://github.com/treasure-data/presto-client-ruby".freeze
  s.licenses = ["Apache-2.0".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 1.9.1".freeze)
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Presto client library".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0.12".freeze])
  s.add_runtime_dependency(%q<msgpack>.freeze, [">= 0.7.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0.9.2".freeze, "< 11.0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 2.13.0".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 2.0.0".freeze])
  s.add_development_dependency(%q<addressable>.freeze, ["~> 2.4.0".freeze])
  s.add_development_dependency(%q<simplecov>.freeze, ["~> 0.10.0".freeze])
end
