# -*- encoding: utf-8 -*-
# stub: editorconfig 0.2.2 ruby lib

Gem::Specification.new do |s|
  s.name = "editorconfig".freeze
  s.version = "0.2.2".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub".freeze]
  s.date = "2015-09-10"
  s.homepage = "https://github.com/editorconfig/editorconfig-core-ruby".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "2.0.14".freeze
  s.summary = "EditorConfig core library written in Ruby".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 10.0".freeze])
end
