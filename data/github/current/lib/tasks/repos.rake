# frozen_string_literal: true

namespace :repos do
  desc "Reset repository root to pristine state, wiping existing data"
  task :setup => :protect do
    rm_rf GitHub.repository_root
    mkdir_p GitHub.repository_root
  end

  # Fail if we're in production or the repos directory is in a dodgy location.
  task :protect do
    if Rails.env.production? || Rails.env.staging?
      fail "refusing to wipe root in #{Rails.env}"
    elsif !GitHub.repository_root.include?(Rails.root.to_s)
      fail "refusing to modify repos outside of app root"
    end
  end

  desc "Symlink fixture repository hooks directories"
  # Check that the hooks directory for all git repositories under test/fixtures/git are
  # symlinked to the shared git-core hooks. This is necessary to get push and fork
  # and some other operations working properly in development environments.
  task :symlink => [:protect, :environment] do
    Repository.all.each do |repo|
      puts "correcting: #{repo.path}"
      repo.correct_hooks_symlink
    end
  end

  desc "Aggressively pack all example repositories under test/fixtures/git/examples"
  task :pack do
    Dir["test/fixtures/git/examples/*.git"].each do |path|
      path = Pathname.new(path).realpath.to_s
      base = File.basename(path, ".git")
      next if %w[empty mojombo_grit diff_transcode repository_stats_api].include?(base)
      Dir.chdir(path) do
        puts "packing: #{File.basename(path)}"
        verbose(false) {
          sh "git config gc.packrefs true"
          sh "rm -rf logs hooks/*.sample info description FETCH_HEAD ORIG_HEAD dag.cache"
          sh "git gc --quiet --aggressive --prune=0"
          sh "rm -rf info"
        }
      end
    end
  end
end

task :reset_repo_fixtures => "repos:clean"
