# -*- encoding: utf-8 -*-
# stub: net_http_unix 0.2.2 ruby lib

Gem::Specification.new do |s|
  s.name = "net_http_unix".freeze
  s.version = "0.2.2".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Jeff McCune".freeze]
  s.date = "2016-08-11"
  s.description = "Wrapper around Net::HTTP with AF_UNIX support".freeze
  s.email = ["jeff@puppetlabs.com".freeze]
  s.executables = ["net_http_unix".freeze]
  s.files = ["bin/net_http_unix".freeze]
  s.homepage = "http://github.com/puppetlabs/net_http_unix".freeze
  s.licenses = ["Apache 2.0".freeze]
  s.rubygems_version = "2.4.5.1".freeze
  s.summary = "Wrapper around Net::HTTP with AF_UNIX support".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<bundler>.freeze, ["~> 1.3".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<yard>.freeze, [">= 0".freeze])
end
