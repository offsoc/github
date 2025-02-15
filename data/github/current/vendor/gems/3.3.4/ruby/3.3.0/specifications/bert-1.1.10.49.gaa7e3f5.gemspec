# -*- encoding: utf-8 -*-
# stub: bert 1.1.10.49.gaa7e3f5 ruby lib ext
# stub: ext/bert/c/extconf.rb

Gem::Specification.new do |s|
  s.name = "bert".freeze
  s.version = "1.1.10.49.gaa7e3f5".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze, "ext".freeze]
  s.authors = ["Tom Preston-Werner".freeze]
  s.date = "2021-03-18"
  s.description = "BERT Serializiation for Ruby".freeze
  s.email = "tom@mojombo.com".freeze
  s.extensions = ["ext/bert/c/extconf.rb".freeze]
  s.files = ["ext/bert/c/extconf.rb".freeze]
  s.homepage = "http://github.com/github/bert".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.1.2".freeze
  s.summary = "BERT Serializiation for Ruby".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<mochilo>.freeze, [">= 1.3".freeze, "!= 2.0".freeze])
  s.add_development_dependency(%q<thoughtbot-shoulda>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<git>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake-compiler>.freeze, ["~> 0.9.0".freeze])
  s.add_development_dependency(%q<yajl-ruby>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<test-unit>.freeze, [">= 0".freeze])
end
