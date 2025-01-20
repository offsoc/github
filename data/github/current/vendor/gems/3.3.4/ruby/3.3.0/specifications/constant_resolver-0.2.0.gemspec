# -*- encoding: utf-8 -*-
# stub: constant_resolver 0.2.0 ruby lib

Gem::Specification.new do |s|
  s.name = "constant_resolver".freeze
  s.version = "0.2.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.org", "changelog_uri" => "https://github.com/Shopify/constant_resolver/releases", "homepage_uri" => "https://github.com/Shopify/constant_resolver", "source_code_uri" => "https://github.com/Shopify/constant_resolver" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Philip M\u00FCller".freeze]
  s.date = "2022-04-01"
  s.description = "Given a code base that adheres to certain conventions, ConstantResolver resolves any, even partially qualified,\nconstant to the path of the file that defines it.\n".freeze
  s.email = ["philip.mueller@shopify.com".freeze]
  s.homepage = "https://github.com/Shopify/constant_resolver".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.2.20".freeze
  s.summary = "Statically resolve any ruby constant".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rake>.freeze, ["~> 10.0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.0".freeze])
end
