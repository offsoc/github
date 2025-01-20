# -*- encoding: utf-8 -*-
# stub: openssl-extensions 1.2.1 ruby lib

Gem::Specification.new do |s|
  s.name = "openssl-extensions".freeze
  s.version = "1.2.1"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Envy Labs".freeze]
  s.date = "2013-06-11"
  s.description = "This library patches OpenSSL to add helper methods and extensions to OpenSSL objects with the intention of making the interface more intuitive.".freeze
  s.email = ["".freeze]
  s.homepage = "http://github.com/envylabs/openssl-extensions".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.4.10".freeze
  s.summary = "Helper methods and extensions for OpenSSL to make the interface more intuitive.".freeze

  s.installed_by_version = "3.4.10" if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rspec>.freeze, ["~> 2.4"])
end
