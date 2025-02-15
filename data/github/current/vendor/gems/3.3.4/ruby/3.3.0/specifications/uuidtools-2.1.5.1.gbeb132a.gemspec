# -*- encoding: utf-8 -*-
# stub: uuidtools 2.1.5.1.gbeb132a ruby lib

Gem::Specification.new do |s|
  s.name = "uuidtools".freeze
  s.version = "2.1.5.1.gbeb132a".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Bob Aman".freeze]
  s.date = "2014-08-12"
  s.description = "A simple universally unique ID generation library.\n".freeze
  s.email = "bob@sporkmonger.com".freeze
  s.extra_rdoc_files = ["README.md".freeze]
  s.files = ["README.md".freeze]
  s.homepage = "https://github.com/sporkmonger/uuidtools".freeze
  s.rdoc_options = ["--main".freeze, "README.md".freeze]
  s.rubygems_version = "3.5.11".freeze
  s.summary = "UUID generator".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rake>.freeze, [">= 0.7.3".freeze])
  s.add_development_dependency(%q<rspec>.freeze, [">= 2.9.0".freeze])
  s.add_development_dependency(%q<yard>.freeze, [">= 0.8.2".freeze])
  s.add_development_dependency(%q<launchy>.freeze, [">= 2.0.0".freeze])
end
