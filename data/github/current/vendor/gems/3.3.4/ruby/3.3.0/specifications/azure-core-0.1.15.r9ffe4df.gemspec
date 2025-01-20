# -*- encoding: utf-8 -*-
# stub: azure-core 0.1.15.r9ffe4df ruby lib

Gem::Specification.new do |s|
  s.name = "azure-core".freeze
  s.version = "0.1.15.r9ffe4df".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Microsoft Corporation".freeze, "AppFog".freeze]
  s.date = "2024-06-07"
  s.description = "Microsoft Azure Client Core Library for Ruby SDK".freeze
  s.email = "azureruby@microsoft.com".freeze
  s.homepage = "http://github.com/Azure/azure-ruby-asm-core".freeze
  s.licenses = ["Apache License, Version 2.0".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 1.9.3".freeze)
  s.rubygems_version = "3.5.9".freeze
  s.summary = "Core library to be consumed by Ruby SDK gems".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0.9".freeze, "< 2".freeze])
  s.add_runtime_dependency(%q<faraday_middleware>.freeze, [">= 0.10".freeze, "< 2".freeze])
  s.add_runtime_dependency(%q<nokogiri>.freeze, ["~> 1.6".freeze])
  s.add_development_dependency(%q<dotenv>.freeze, ["~> 2.0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5".freeze])
  s.add_development_dependency(%q<minitest-reporters>.freeze, ["~> 1".freeze])
  s.add_development_dependency(%q<mocha>.freeze, ["~> 1.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 10.0".freeze])
  s.add_development_dependency(%q<timecop>.freeze, ["~> 0.7".freeze])
  s.add_development_dependency(%q<bundler>.freeze, ["~> 1.11".freeze])
end
