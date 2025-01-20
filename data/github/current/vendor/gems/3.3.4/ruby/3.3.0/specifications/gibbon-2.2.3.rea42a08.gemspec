# -*- encoding: utf-8 -*-
# stub: gibbon 2.2.3.rea42a08 ruby lib

Gem::Specification.new do |s|
  s.name = "gibbon".freeze
  s.version = "2.2.3.rea42a08".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Amro Mousa".freeze]
  s.date = "2024-06-10"
  s.description = "A wrapper for MailChimp API 3.0".freeze
  s.email = ["amromousa@gmail.com".freeze]
  s.homepage = "http://github.com/amro/gibbon".freeze
  s.licenses = ["MIT".freeze]
  s.post_install_message = "IMPORTANT: Gibbon now targets MailChimp API 3.0, which is very different from API 2.0. Use Gibbon 1.x if you need to target API 2.0.".freeze
  s.required_ruby_version = Gem::Requirement.new(">= 2.0.0".freeze)
  s.rubygems_version = "3.5.9".freeze
  s.summary = "A wrapper for MailChimp API 3.0".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0.9.1".freeze])
  s.add_runtime_dependency(%q<multi_json>.freeze, [">= 1.11.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["= 3.2.0".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 1.21.0".freeze])
end
