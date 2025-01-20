# -*- encoding: utf-8 -*-
# stub: bertrpc 1.3.1.github11.2.gd3ec521 ruby lib

Gem::Specification.new do |s|
  s.name = "bertrpc".freeze
  s.version = "1.3.1.github11.2.gd3ec521".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub, Inc.".freeze]
  s.date = "2014-08-19"
  s.email = "systems@github.com".freeze
  s.homepage = "http://github.com/github/bertrpc".freeze
  s.rdoc_options = ["--charset=UTF-8".freeze]
  s.rubygems_version = "3.5.11".freeze
  s.summary = "BERTRPC is a Ruby BERT-RPC client library.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<bert>.freeze, ["= 1.1.10.49.gaa7e3f5".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.0".freeze])
end
