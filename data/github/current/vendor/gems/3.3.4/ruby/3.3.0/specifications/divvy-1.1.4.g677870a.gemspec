# -*- encoding: utf-8 -*-
# stub: divvy 1.1.4.g677870a ruby lib

Gem::Specification.new do |s|
  s.name = "divvy".freeze
  s.version = "1.1.4.g677870a".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["@rtomayko".freeze]
  s.date = "2013-05-01"
  s.description = "little ruby parallel script runner".freeze
  s.email = ["rtomayko@gmail.com".freeze]
  s.executables = ["divvy".freeze]
  s.files = ["bin/divvy".freeze]
  s.homepage = "https://github.com/rtomayko/divvy".freeze
  s.rubygems_version = "1.8.23".freeze
  s.summary = "...".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 3

  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, [">= 0".freeze])
end
