# -*- encoding: utf-8 -*-
# stub: unicornfigure 0.1.2 ruby lib

Gem::Specification.new do |s|
  s.name = "unicornfigure".freeze
  s.version = "0.1.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["sbryant".freeze, "benburkert".freeze]
  s.date = "2023-05-12"
  s.description = "extensions for unicorn's configuration file".freeze
  s.rubygems_version = "3.4.10".freeze
  s.summary = "extensions for unicorn's configuration file".freeze

  s.installed_by_version = "3.4.10" if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<unicorn>.freeze, [">= 0"])
  s.add_runtime_dependency(%q<failbot>.freeze, [">= 0"])
end
