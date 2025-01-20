# frozen_string_literal: true

require "rake/sprocketstask"

require "manage"

Rake::SprocketsTask.new do |t|
  t.name        = "assets:precompile"
  t.environment = Manage::App.assets
  t.manifest    = Sprockets::Helpers.manifest

  pages = Dir["assets/javascripts/pages/**/*.js"].map do |name|
    name.sub("assets/javascripts/", "")
  end

  t.assets = pages + %w[
    application.js
    vendor.js
    application.css
    dev.css
    octicons/octicons/octicons.svg
    octicons/octicons/octicons.woff
    octicons/octicons/octicons.eot
    octicons/octicons/octicons.ttf
  ]
end
