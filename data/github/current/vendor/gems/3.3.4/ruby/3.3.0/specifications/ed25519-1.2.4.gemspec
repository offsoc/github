# -*- encoding: utf-8 -*-
# stub: ed25519 1.2.4 ruby lib
# stub: ext/ed25519_ref10/extconf.rb

Gem::Specification.new do |s|
  s.name = "ed25519".freeze
  s.version = "1.2.4".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Tony Arcieri".freeze]
  s.bindir = "exe".freeze
  s.date = "2018-01-05"
  s.description = "A Ruby binding to the Ed25519 elliptic curve public-key signature system described in RFC 8032.".freeze
  s.email = ["tony.arcieri@gmail.com".freeze]
  s.extensions = ["ext/ed25519_ref10/extconf.rb".freeze]
  s.files = ["ext/ed25519_ref10/extconf.rb".freeze]
  s.homepage = "https://github.com/crypto-rb/ed25519".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.0.0".freeze)
  s.rubygems_version = "2.7.4".freeze
  s.summary = "An efficient digital signature library providing the Ed25519 algorithm".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<bundler>.freeze, ["~> 1.16".freeze])
end
