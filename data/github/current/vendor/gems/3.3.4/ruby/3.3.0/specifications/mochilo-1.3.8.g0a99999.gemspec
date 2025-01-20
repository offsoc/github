# -*- encoding: utf-8 -*-
# stub: mochilo 1.3.8.g0a99999 ruby lib
# stub: ext/mochilo/extconf.rb

Gem::Specification.new do |s|
  s.name = "mochilo".freeze
  s.version = "1.3.8.g0a99999".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Vicent Mart\u00ED".freeze, "Brian Lopez".freeze]
  s.date = "2023-08-15"
  s.email = "vicent@github.com seniorlopez@gmail.com".freeze
  s.extensions = ["ext/mochilo/extconf.rb".freeze]
  s.files = ["ext/mochilo/extconf.rb".freeze]
  s.homepage = "http://github.com/brianmario/mochilo".freeze
  s.rdoc_options = ["--charset=UTF-8".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.4.0".freeze)
  s.rubygems_version = "3.4.10".freeze
  s.summary = "A ruby library for BananaPack".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rake-compiler>.freeze, [">= 0.8.1".freeze])
  s.add_development_dependency(%q<minitest>.freeze, [">= 4.1.0".freeze])
end
