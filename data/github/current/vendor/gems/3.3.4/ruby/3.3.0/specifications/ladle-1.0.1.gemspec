# -*- encoding: utf-8 -*-
# stub: ladle 1.0.1 ruby lib

Gem::Specification.new do |s|
  s.name = "ladle".freeze
  s.version = "1.0.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Rhett Sutphin".freeze]
  s.date = "2015-05-01"
  s.description = "Provides an embedded LDAP server for BDD.  The embedded server is built with ApacheDS.".freeze
  s.email = ["rhett@detailedbalance.net".freeze]
  s.homepage = "http://github.com/NUBIC/ladle".freeze
  s.rubygems_version = "2.4.3".freeze
  s.summary = "Dishes out steaming helpings of LDAP for fluid testing".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<open4>.freeze, ["~> 1.0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.0".freeze])
  s.add_development_dependency(%q<yard>.freeze, ["~> 0.6.1".freeze])
  s.add_development_dependency(%q<rdiscount>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<net-ldap>.freeze, ["~> 0.3.1".freeze])
  s.add_development_dependency(%q<ci_reporter>.freeze, ["~> 1.6".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 0.9.2".freeze])
end
