# -*- encoding: utf-8 -*-
# stub: homograph-detector 0.1.1 ruby lib

Gem::Specification.new do |s|
  s.name = "homograph-detector".freeze
  s.version = "0.1.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Kickstarter Engineering".freeze]
  s.date = "2018-07-03"
  s.email = "eng@kickstarter.com".freeze
  s.homepage = "https://github.com/kickstarter/ruby-homograph-detector".freeze
  s.licenses = ["Apache-2.0".freeze]
  s.rubygems_version = "2.7.6".freeze
  s.summary = "Ruby Gem used for homograph detection".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<addressable>.freeze, ["~> 2.5".freeze])
  s.add_runtime_dependency(%q<unicode-confusable>.freeze, ["~> 1.4".freeze])
  s.add_runtime_dependency(%q<unicode-scripts>.freeze, ["~> 1.3".freeze])
  s.add_development_dependency(%q<bundler>.freeze, ["~> 1.16".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.10".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 10.0".freeze])
  s.add_development_dependency(%q<shoulda-context>.freeze, ["~> 1.2".freeze])
  s.add_development_dependency(%q<simplecov>.freeze, ["~> 0.16.1".freeze])
end
