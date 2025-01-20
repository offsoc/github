# -*- encoding: utf-8 -*-
# stub: cbor 0.5.9.8 ruby lib
# stub: ext/cbor/extconf.rb

Gem::Specification.new do |s|
  s.name = "cbor".freeze
  s.version = "0.5.9.8".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Carsten Bormann, standing on the tall shoulders of Sadayuki Furuhashi".freeze]
  s.date = "2023-12-31"
  s.description = "CBOR is a library for the CBOR binary object representation format, based on Sadayuki Furuhashi's MessagePack library.".freeze
  s.email = "cabo@tzi.org".freeze
  s.extensions = ["ext/cbor/extconf.rb".freeze]
  s.files = ["ext/cbor/extconf.rb".freeze]
  s.homepage = "http://cbor.io/".freeze
  s.licenses = ["Apache-2.0".freeze]
  s.rubygems_version = "3.4.10".freeze
  s.summary = "CBOR, Concise Binary Object Representation.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 0.9.2".freeze])
  s.add_development_dependency(%q<rake-compiler>.freeze, ["~> 0.8.3".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 2.11".freeze])
  s.add_development_dependency(%q<json>.freeze, ["~> 1.7".freeze])
  s.add_development_dependency(%q<yard>.freeze, ["~> 0.9.11".freeze])
end
