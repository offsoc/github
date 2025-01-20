# -*- encoding: utf-8 -*-
# stub: goomba 0.0.1.524.g069b966 ruby lib
# stub: ext/goomba/extconf.rb

Gem::Specification.new do |s|
  s.name = "goomba".freeze
  s.version = "0.0.1.524.g069b966".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Vicent Marti".freeze]
  s.date = "2023-03-21"
  s.description = "".freeze
  s.email = "vicent@github.com".freeze
  s.extensions = ["ext/goomba/extconf.rb".freeze]
  s.files = ["ext/goomba/extconf.rb".freeze]
  s.homepage = "https://github.com/github/goomba".freeze
  s.rubygems_version = "3.4.6".freeze
  s.summary = "html document transformation".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rake-compiler>.freeze, ["~> 1.0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.5.1".freeze])
end
