# -*- encoding: utf-8 -*-
# stub: azure-storage-common 1.1.0 ruby lib

Gem::Specification.new do |s|
  s.name = "azure-storage-common".freeze
  s.version = "1.1.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Microsoft Corporation".freeze]
  s.date = "2018-12-10"
  s.description = "Microsoft Azure Storage Common Client Library for Ruby".freeze
  s.email = "ascl@microsoft.com".freeze
  s.homepage = "http://github.com/azure/azure-storage-ruby".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 1.9.3".freeze)
  s.rubygems_version = "2.5.1".freeze
  s.summary = "Official Ruby client library to consume Azure Storage Common service".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<azure-core>.freeze, ["~> 0.1.13".freeze])
  s.add_runtime_dependency(%q<nokogiri>.freeze, ["~> 1.6".freeze, ">= 1.6.8".freeze])
  s.add_development_dependency(%q<dotenv>.freeze, ["~> 2.0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5".freeze])
  s.add_development_dependency(%q<minitest-reporters>.freeze, ["~> 1".freeze])
  s.add_development_dependency(%q<mocha>.freeze, ["~> 1.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 10.0".freeze])
  s.add_development_dependency(%q<timecop>.freeze, ["~> 0.7".freeze])
  s.add_development_dependency(%q<yard>.freeze, ["~> 0.9".freeze, ">= 0.9.11".freeze])
end
