# -*- encoding: utf-8 -*-
# stub: prawn-svg 0.35.1 ruby lib

Gem::Specification.new do |s|
  s.name = "prawn-svg".freeze
  s.version = "0.35.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "rubygems_mfa_required" => "true" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Mog Nesbitt".freeze]
  s.date = "2024-07-17"
  s.description = "This gem allows you to render SVG directly into a PDF using the 'prawn' gem.  Since PDF is vector-based, you'll get nice scaled graphics if you use SVG instead of an image.".freeze
  s.email = "mog@seriousorange.com".freeze
  s.homepage = "http://github.com/mogest/prawn-svg".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.7.0".freeze)
  s.rubygems_version = "3.5.3".freeze
  s.summary = "SVG renderer for Prawn PDF library".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<css_parser>.freeze, ["~> 1.6".freeze])
  s.add_runtime_dependency(%q<matrix>.freeze, ["~> 0.4.2".freeze])
  s.add_runtime_dependency(%q<prawn>.freeze, [">= 0.11.1".freeze, "< 3".freeze])
  s.add_runtime_dependency(%q<rexml>.freeze, [">= 3.2.0".freeze, "< 4".freeze])
end
