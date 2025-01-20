# -*- encoding: utf-8 -*-
# stub: premailer 1.24.0 ruby lib

Gem::Specification.new do |s|
  s.name = "premailer".freeze
  s.version = "1.24.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "rubygems_mfa_required" => "true", "yard.run" => "yri" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Alex Dunae".freeze]
  s.date = "2024-08-15"
  s.description = "Improve the rendering of HTML emails by making CSS inline, converting links and warning about unsupported code.".freeze
  s.email = "akzhan.abdulin@gmail.com".freeze
  s.executables = ["premailer".freeze]
  s.files = ["bin/premailer".freeze]
  s.homepage = "https://github.com/premailer/premailer".freeze
  s.licenses = ["BSD-3-Clause".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.0".freeze)
  s.rubygems_version = "3.4.10".freeze
  s.summary = "Preflight for HTML e-mail.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<css_parser>.freeze, [">= 1.12.0".freeze])
  s.add_runtime_dependency(%q<htmlentities>.freeze, [">= 4.0.0".freeze])
  s.add_runtime_dependency(%q<addressable>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 1.3".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["> 0.8".freeze, "!= 0.9.0".freeze])
  s.add_development_dependency(%q<nokogiri>.freeze, ["~> 1.16".freeze])
  s.add_development_dependency(%q<redcarpet>.freeze, ["~> 3.0".freeze])
  s.add_development_dependency(%q<maxitest>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<coveralls>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<webmock>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<bump>.freeze, [">= 0".freeze])
end
