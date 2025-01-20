# -*- encoding: utf-8 -*-
# stub: rack_csrf 2.7.0 ruby lib

Gem::Specification.new do |s|
  s.name = "rack_csrf".freeze
  s.version = "2.7.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Emanuele Vicentini".freeze]
  s.date = "2022-09-10"
  s.description = "Anti-CSRF Rack middleware".freeze
  s.email = ["emanuele.vicentini@gmail.com".freeze]
  s.extra_rdoc_files = ["LICENSE.rdoc".freeze, "README.rdoc".freeze]
  s.files = ["LICENSE.rdoc".freeze, "README.rdoc".freeze]
  s.homepage = "https://github.com/baldowl/rack_csrf".freeze
  s.licenses = ["MIT".freeze]
  s.rdoc_options = ["--line-numbers".freeze, "--inline-source".freeze, "--title".freeze, "Rack::Csrf 2.7.0".freeze, "--main".freeze, "README.rdoc".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 1.9.2".freeze)
  s.rubygems_version = "3.4.10".freeze
  s.summary = "Anti-CSRF Rack middleware".freeze

  s.installed_by_version = "3.4.10" if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<rack>.freeze, [">= 1.1.0"])
  s.add_development_dependency(%q<bundler>.freeze, [">= 1.0.0"])
  s.add_development_dependency(%q<rake>.freeze, [">= 0"])
  s.add_development_dependency(%q<cucumber>.freeze, ["~> 3.0"])
  s.add_development_dependency(%q<rack-test>.freeze, [">= 0"])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.0"])
  s.add_development_dependency(%q<rdoc>.freeze, [">= 2.4.2"])
  s.add_development_dependency(%q<git>.freeze, [">= 1.2.5"])
end
