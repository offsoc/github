# -*- encoding: utf-8 -*-
# stub: oa-enterprise 0.3.2.g3930d46 ruby lib

Gem::Specification.new do |s|
  s.name = "oa-enterprise".freeze
  s.version = "0.3.2.g3930d46".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["James A. Rosen".freeze, "Ping Yu".freeze, "Michael Bleigh".freeze, "Erik Michaels-Ober".freeze, "Raecoo Cao".freeze]
  s.date = "2018-07-27"
  s.description = "Enterprise strategies for OmniAuth.".freeze
  s.email = ["james.a.rosen@gmail.com".freeze, "ping@intridea.com".freeze, "michael@intridea.com".freeze, "sferik@gmail.com".freeze, "raecoo@intridea.com".freeze]
  s.homepage = "http://github.com/intridea/omniauth".freeze
  s.rubygems_version = "3.0.0.beta1".freeze
  s.summary = "Enterprise strategies for OmniAuth.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<addressable>.freeze, ["~> 2.2".freeze])
  s.add_runtime_dependency(%q<net-ldap>.freeze, [">= 0.2.2".freeze])
  s.add_runtime_dependency(%q<nokogiri>.freeze, ["~> 1.5".freeze])
  s.add_runtime_dependency(%q<oa-core>.freeze, ["= 0.3.2.g3930d46".freeze])
  s.add_runtime_dependency(%q<pyu-ruby-sasl>.freeze, ["~> 0.0.3.1".freeze])
  s.add_runtime_dependency(%q<rubyntlm>.freeze, ["~> 0.1.1".freeze])
  s.add_runtime_dependency(%q<xmlcanonicalizer>.freeze, ["~> 0.1.2".freeze])
  s.add_development_dependency(%q<rack-test>.freeze, ["~> 0.5".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 0.8".freeze])
  s.add_development_dependency(%q<rdiscount>.freeze, ["~> 1.6".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 2.5".freeze])
  s.add_development_dependency(%q<simplecov>.freeze, ["~> 0.4".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 1.7".freeze])
  s.add_development_dependency(%q<yard>.freeze, ["~> 0.7".freeze])
end
