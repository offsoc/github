# -*- encoding: utf-8 -*-
# stub: xmlcanonicalizer 0.1.2 ruby lib

Gem::Specification.new do |s|
  s.name = "xmlcanonicalizer".freeze
  s.version = "0.1.2".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Andrew Ferk".freeze]
  s.date = "2012-07-05"
  s.description = "This is taken from XMLCanonicalizer/WSS4R and http://github.com/borisnadion/xml-canonicalizer".freeze
  s.email = "andrewferk@gmail.com".freeze
  s.extra_rdoc_files = ["LICENSE".freeze, "README.rdoc".freeze]
  s.files = ["LICENSE".freeze, "README.rdoc".freeze]
  s.homepage = "http://github.com/andrewferk/xmlcanonicalizer".freeze
  s.rubygems_version = "1.8.24".freeze
  s.summary = "XML Canonicalizer for Ruby >= 1.9.2".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 3

  s.add_development_dependency(%q<rdoc>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<shoulda>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, ["~> 1.1.0".freeze])
  s.add_development_dependency(%q<jeweler>.freeze, ["~> 1.6.4".freeze])
  s.add_development_dependency(%q<thoughtbot-shoulda>.freeze, [">= 0".freeze])
end
