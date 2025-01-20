# -*- encoding: utf-8 -*-
# stub: fnv 0.2.0 ruby lib

Gem::Specification.new do |s|
  s.name = "fnv".freeze
  s.version = "0.2.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Jake Douglas".freeze]
  s.date = "2011-07-16"
  s.email = "jakecdouglas@gmail.com".freeze
  s.extra_rdoc_files = ["LICENSE".freeze, "README.md".freeze]
  s.files = ["LICENSE".freeze, "README.md".freeze]
  s.homepage = "https://github.com/jakedouglas/fnv".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "1.6.2".freeze
  s.summary = "fnv1 and fnv1a hash functions in pure ruby".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 3

  s.add_development_dependency(%q<bundler>.freeze, ["~> 1.0.0".freeze])
  s.add_development_dependency(%q<jeweler>.freeze, ["~> 1.6.4".freeze])
end
