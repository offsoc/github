# -*- encoding: utf-8 -*-
# stub: geoip2_compat 0.0.3 ruby lib
# stub: ext/geoip2_compat/extconf.rb

Gem::Specification.new do |s|
  s.name = "geoip2_compat".freeze
  s.version = "0.0.3".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Dirkjan Bussink".freeze]
  s.date = "2014-12-29"
  s.description = "Lookup IPv4 and IPv6 addresses in Maxmind GeoIP2 database files".freeze
  s.email = ["d.bussink@gmail.com".freeze]
  s.extensions = ["ext/geoip2_compat/extconf.rb".freeze]
  s.files = ["ext/geoip2_compat/extconf.rb".freeze]
  s.homepage = "http://github.com/dbussink/geoip2_compat".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "2.2.2".freeze
  s.summary = "Bindings for libmaxminddb to access GeoIP2 database files".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rake>.freeze, ["~> 10.0".freeze])
  s.add_development_dependency(%q<rake-compiler>.freeze, ["~> 0".freeze])
  s.add_development_dependency(%q<test-unit>.freeze, ["~> 0".freeze])
end
