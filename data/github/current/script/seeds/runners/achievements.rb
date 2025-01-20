# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Achievements < Seeds::Runner
      def self.help
        <<~HELP
        Grant achievements to a user.
        HELP
      end

      def self.run(options = {})
        user = Seeds::Objects::User.create(login: options[:user])

        grant_all = options[:achievement].delete("all")
        to_grant = []
        Achievable.all_known.each do |achievable|
          if grant_all || matches_any?(options[:achievement], achievable)
            to_grant << achievable
          end
        end

        if to_grant.empty?
          puts "No achievements match any of the patterns that you provided."
          puts
          puts "Known achievements:"
          Achievable.all_known.each do |achievable|
            puts " - #{achievable.display_name} (#{achievable.slug})"
          end
          puts " - all [to grant all known achievements]"
          return
        end

        puts "Granting the following achievements to #{user.login}:"
        puts "  #{to_grant.map(&:display_name).join(", ")}"
        puts

        enable_feature_flags

        to_grant.each do |achievable|
          granted_tier = options[:tier].clamp(0, achievable.highest_tier)
          visibilities = options[:private_only] ? %i(PRIVATE) : %i(PUBLIC PRIVATE)

          0.upto(granted_tier) do |tier|
            visibilities.each do |visibility|
              if user.has_achievement_with_tier?(achievable, tier, visibility:)
                puts "... #{achievable.display_name} has already been granted at tier #{tier}."
                next
              end

              model = unlocking_model(user: user, achievable: achievable)
              if model.nil? && !achievable.has_dynamic_unlocking_model?
                puts "!!! Unable to grant #{achievable.display_name} at tier #{tier}"
                puts "!!! Cannot create unlocking model"
                next
              end

              oid = unlocking_oid(achievable: achievable, unlocking_model: model)
              ach = user.achievements.create(
                achievable_slug: achievable.slug,
                tier: tier,
                unlocking_model: model,
                unlocking_oid: oid,
                visibility: visibility == :PRIVATE ? :private_scope : :public_scope,
              )

              if ach.valid?
                puts "... Granted #{visibility} #{achievable.display_name} at tier #{tier}."
              else
                puts "!!! Unable to grant #{visibility} #{achievable.display_name} at tier #{tier}:"
                puts "!!! #{ach.errors.full_messages.join(", ")}"
              end
            end
          end
        end

        slugs = to_grant.map { |a| "#{a.slug}:0" }.join(",")
        user.metadata.update(achievement_private_slugs: slugs, achievement_public_slugs: slugs)
      end

      def self.matches_any?(patterns, achievable)
        patterns.any? { |pattern| achievable.slug.include?(pattern.downcase) }
      end

      def self.enable_feature_flags
        Achievable.all_known.each do |achievable|
          enable_feature_flag(achievable.feature_flag_name)
        end
      end

      def self.enable_feature_flag(flag_name)
        unless GitHub.flipper[flag_name].enabled?
          GitHub.flipper[flag_name].enable
          puts "... enabled feature flag #{flag_name}."
        end
      end

      def self.unlocking_model(user:, achievable:)
        case achievable
        when Achievable::DustBunny, Achievable::Polyglot, Achievable::Starstruck
          repo(user: user)
        when Achievable::GalaxyBrain
          chosen_discussion_comment(author: user)
        when Achievable::HeartOnYourSleeve, Achievable::Heartbreaker
          issue(author: user)
        when Achievable::OpenSourcerer, Achievable::PullShark, Achievable::Quickdraw, Achievable::Yolo, Achievable::PairExtraordinaire
          pull_request(author: user)
        when Achievable::PublicSponsor
          create_public_sponsor(user)
        when Achievable::ProximaPioneer, Achievable::ProximaStaffshipper, Achievable::ProximaStaffuser, Achievable::ProximaShipper, Achievable::ProximaPrivateGa, Achievable::ProximaPublicGa
          pull_request(author: user)
        when Achievable::ArcticCodeVaultContributor
          create_arctic_code_vault_contributor(user)
          nil
        when Achievable::Mars2020Contributor
          create_mars_2020_contributor(user)
          nil
        else
          # To fix: add this Achievable to the case statement above. Return its appropiate kind of unlocking model.
          raise "Unrecognized achievable: #{achievable.class.name}"
        end
      end

      def self.unlocking_oid(achievable:, unlocking_model:)
        return nil unless achievable.needs_unlocking_oid?
        unlocking_model.default_oid
      end

      def self.create_public_sponsor(user)
        if user.metadata.has_sponsoring_badge?
          return user.active_sponsorships_as_sponsor_relation.privacy_public.first
        end

        require_relative "../factory_bot_loader"

        sponsorship = FactoryBot.create(:sponsorship)
        sponsorship.update(sponsor: user)
        user.metadata.update(has_sponsoring_badge: true)
        sponsorship
      end

      def self.create_mars_2020_contributor(user)
        return if user.metadata.has_nasa_badge?

        highlight = user.profile_highlights.create(
          highlight_type: :nasa_2020,
          eligible: true,
          hidden: false,
        )
        highlight.profile_highlight_contributions.create(
          repository: repo(user: user),
          contributor_email: user.email,
          ignore: false,
        )
        user.metadata.update(has_nasa_badge: true)
      end

      def self.create_arctic_code_vault_contributor(user)
        return if user.metadata.has_acv_badge?

        AcvContributor.create(repository: repo(user: user), contributor_email: user.email)
        user.metadata.update(has_acv_badge: true)
      end

      def self.repo(user:)
        ::Repository.public_scope.first || Seeds::Objects::Repository.create(
          owner_name: user.login,
          setup_master: true,
          is_public: true,
        )
      end

      def self.issue(author:)
        repository = self.repo(user: author)
        repository.issues.first || Seeds::Objects::Issue.create(repo: repository, actor: author)
      end

      def self.pull_request(author:)
        repository = self.repo(user: author)
        repository.pull_requests.first || Seeds::Objects::PullRequest.create(repo: repository, committer: author)
      end

      def self.chosen_discussion_comment(author:)
        existing = DiscussionComment.where(user: author).chosen_answers.first
        return existing if existing

        repository = self.repo(user: author)
        repository.turn_on_discussions(actor: author, instrument: false)
        category = repository.discussion_categories.find(&:supports_mark_as_answer?)
        discussion = repository.discussions.create(
          user: author,
          title: "A discussion",
          body: "A comment",
          category: category,
        )
        unless discussion.valid?
          puts "!!! Unable to create discussion"
          puts "!!! #{discussion.errors.full_messages.join(", ")}"
          return nil
        end
        comment = discussion.comments.create(user: author, body: "An answer")
        unless comment.valid?
          puts "!!! Unable to create discussion comment"
          puts "!!! #{comment.errors.full_messages.join(", ")}"
          return nil
        end
        unless comment.mark_as_answer(actor: author)
          puts "!!! Unable to mark discussion comment as answer"
          return nil
        end
        comment
      end
    end
  end
end
