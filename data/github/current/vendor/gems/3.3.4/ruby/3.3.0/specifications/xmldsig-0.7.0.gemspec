# -*- encoding: utf-8 -*-
# stub: xmldsig 0.7.0 ruby lib

Gem::Specification.new do |s|
  s.name = "xmldsig".freeze
  s.version = "0.7.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["benoist".freeze]
  s.date = "2022-06-16"
  s.description = "This gem is a (partial) implementation of the XMLDsig specification".freeze
  s.email = ["benoist.claassen@gmail.com".freeze]
  s.homepage = "https://github.com/benoist/xmldsig".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 1.9.2".freeze)
  s.rubygems_version = "3.3.7".freeze
  s.summary = "This gem is a (partial) implementation of the XMLDsig specification (http://www.w3.org/TR/xmldsig-core)".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<nokogiri>.freeze, [">= 1.6.8".freeze, "< 2.0.0".freeze])
end
