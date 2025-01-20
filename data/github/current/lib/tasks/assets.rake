# frozen_string_literal: true

require "tmpdir"
require "fileutils"

namespace :assets do
  asset_path = "#{Rails.root}/public/assets"

  # Altough we don't use Sprockets anymore, this set of tasks is kept for compatibility
  # https://github.com/github/heaven/blob/30bdd2b08060acf45a111ae0a58d26c92d24044c/config/capfiles/github.rb#L489-L495
  task :precompile do
    compile_path = Dir.mktmpdir("precompile-assets", "#{Rails.root}/tmp")
    sh({ "ASSETS_PATH" => compile_path, "ENTERPRISE" => GitHub.enterprise?.to_s }, "bin/npm", "run", "precompile-assets")
    rm_rf asset_path
    mv compile_path, asset_path
  end


  # For each bundle, keep only the latest version + 2 backups and delete all
  # older files.
  task :clean do
    assets = Dir["#{asset_path}/**/*"].reject do |file|
      ext = File.extname(file)
      ext.empty? || ext == ".json"
    end
    assets = assets.sort_by { |file| File.mtime(file) }.reverse
    all = assets.inject({}) do |memo, file|
      base = file.sub("#{asset_path}/", "").sub(/-[a-f0-9]{32,}\./, ".")
      (memo[base] ||= []) << file
      memo
    end
    to_remove = all.flat_map { |_, files| files.slice(3..-1) }.compact
    rm(to_remove, verbose: false)
  end

  task :clobber do
    rm_rf asset_path
  end
end
