# -*- encoding: utf-8 -*-
# stub: memcached 1.9.0.r9429dfc ruby lib
# stub: ext/rlibmemcached/extconf.rb

Gem::Specification.new do |s|
  s.name = "memcached".freeze
  s.version = "1.9.0.r9429dfc".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Arthur Neves".freeze, "Evan Weaver".freeze]
  s.date = "2024-07-09"
  s.description = "An interface to the libmemcached C client.".freeze
  s.email = "arthurnn@gmail.com".freeze
  s.extensions = ["ext/rlibmemcached/extconf.rb".freeze]
  s.files = ["ext/rlibmemcached/extconf.rb".freeze]
  s.homepage = "http://evan.github.com/evan/memcached/".freeze
  s.licenses = ["Academic Free License 3.0 (AFL-3.0)".freeze]
  s.rubygems_version = "3.5.11".freeze
  s.summary = "An interface to the libmemcached C client.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<mocha>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<activesupport>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake-compiler>.freeze, [">= 0".freeze])
end
