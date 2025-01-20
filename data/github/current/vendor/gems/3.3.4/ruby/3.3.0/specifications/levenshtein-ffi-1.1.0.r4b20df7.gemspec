# -*- encoding: utf-8 -*-
# stub: levenshtein-ffi 1.1.0.r4b20df7 ruby lib
# stub: ext/levenshtein/extconf.rb

Gem::Specification.new do |s|
  s.name = "levenshtein-ffi".freeze
  s.version = "1.1.0.r4b20df7".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["David Balatero".freeze]
  s.date = "2014-08-11"
  s.description = "Provides a fast, cross-Ruby implementation of the levenshtein distance algorithm.".freeze
  s.email = "dbalatero@gmail.com".freeze
  s.extensions = ["ext/levenshtein/extconf.rb".freeze]
  s.extra_rdoc_files = ["README.markdown".freeze]
  s.files = ["README.markdown".freeze, "ext/levenshtein/extconf.rb".freeze]
  s.homepage = "http://github.com/dbalatero/levenshtein-ffi".freeze
  s.licenses = ["BSD 2-Clause".freeze]
  s.rubygems_version = "3.3.7".freeze
  s.summary = "An FFI version of the levenshtein gem.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<ffi>.freeze, ["~> 1.9".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 2.99".freeze])
  s.add_development_dependency(%q<jeweler>.freeze, ["~> 2.0".freeze])
end
