# -*- encoding: utf-8 -*-
# stub: oa-core 0.3.2.g3930d46 ruby lib

Gem::Specification.new do |s|
  s.name = "oa-core".freeze
  s.version = "0.3.2.g3930d46".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Michael Bleigh".freeze, "Erik Michaels-Ober".freeze]
  s.date = "2018-07-27"
  s.description = "Core strategies for OmniAuth.".freeze
  s.email = ["michael@intridea.com".freeze, "sferik@gmail.com".freeze]
  s.homepage = "http://github.com/intridea/omniauth".freeze
  s.rubygems_version = "3.0.0.beta1".freeze
  s.summary = "Core strategies for OmniAuth.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rack-test>.freeze, ["~> 0.5".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 0.8".freeze])
  s.add_development_dependency(%q<rdiscount>.freeze, ["~> 1.6".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 2.5".freeze])
  s.add_development_dependency(%q<simplecov>.freeze, ["~> 0.4".freeze])
  s.add_development_dependency(%q<yard>.freeze, ["~> 0.7".freeze])
end
