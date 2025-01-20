# -*- encoding: utf-8 -*-
# stub: arca 2.3.1 ruby lib

Gem::Specification.new do |s|
  s.name = "arca".freeze
  s.version = "2.3.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Jonathan Hoyt".freeze]
  s.date = "2015-08-07"
  s.description = "Arca is a callback analyzer for ActiveRecord ideally suited for digging yourself out of callback hell".freeze
  s.email = "jonmagic@gmail.com".freeze
  s.homepage = "https://github.com/jonmagic/arca".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.5.3".freeze
  s.summary = "ActiveRecord callback analyzer".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<activerecord>.freeze, ["~> 7.1".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.22".freeze])
  s.add_development_dependency(%q<pry>.freeze, ["~> 0.14".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.2".freeze])
end
