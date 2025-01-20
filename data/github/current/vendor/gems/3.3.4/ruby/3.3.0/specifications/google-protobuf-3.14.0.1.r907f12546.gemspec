# -*- encoding: utf-8 -*-
# stub: google-protobuf 3.14.0.1.r907f12546 ruby lib
# stub: ext/google/protobuf_c/extconf.rb

Gem::Specification.new do |s|
  s.name = "google-protobuf".freeze
  s.version = "3.14.0.1.r907f12546".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "source_code_uri" => "https://github.com/protocolbuffers/protobuf/tree/v3.14.0.1/ruby" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Protobuf Authors".freeze]
  s.date = "2023-02-10"
  s.description = "Protocol Buffers are Google's data interchange format.".freeze
  s.email = "protobuf@googlegroups.com".freeze
  s.extensions = ["ext/google/protobuf_c/extconf.rb".freeze]
  s.files = ["ext/google/protobuf_c/extconf.rb".freeze]
  s.homepage = "https://developers.google.com/protocol-buffers".freeze
  s.licenses = ["BSD-3-Clause".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.3".freeze)
  s.rubygems_version = "3.4.6".freeze
  s.summary = "Protocol Buffers".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rake-compiler-dock>.freeze, [">= 1.0.1".freeze, "< 2.0".freeze])
  s.add_development_dependency(%q<rake-compiler>.freeze, ["~> 1.1.0".freeze])
  s.add_development_dependency(%q<test-unit>.freeze, ["~> 3.0".freeze, ">= 3.0.9".freeze])
  s.add_development_dependency(%q<rubygems-tasks>.freeze, ["~> 0.2.4".freeze])
end
