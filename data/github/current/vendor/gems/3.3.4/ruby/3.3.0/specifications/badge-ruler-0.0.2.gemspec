# -*- encoding: utf-8 -*-
# stub: badge-ruler 0.0.2 ruby lib

Gem::Specification.new do |s|
  s.name = "badge-ruler".freeze
  s.version = "0.0.2".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Mike Coutermarsh".freeze, "Melissa Xie".freeze, "Josh Gross".freeze]
  s.date = "2022-01-21"
  s.description = "Mainly used to generate badges, this calculates the width of a given string written in Verdana.".freeze
  s.email = ["mscoutermarsh@github.com".freeze, "mxie@github.com".freeze, "joshmgross@github.com".freeze]
  s.homepage = "https://github.com/github/badge-ruler".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.2.5".freeze
  s.summary = "Calculates text width written in Verdana.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.11.3".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 12.3.3".freeze])
end
