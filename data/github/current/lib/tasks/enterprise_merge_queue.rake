# rubocop:disable Sorbet/TrueSigil
# typed: false
# frozen_string_literal: true

namespace :enterprise do
  namespace :merge_queue do
    # Create the Merge Queue internal app on a GHES instance.
    task :create => :environment do
      return unless GitHub.enterprise?

      Apps::Internal::MergeQueue.seed_database!
    end
  end
end
