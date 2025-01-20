# typed: true
# frozen_string_literal: true

require_relative "../runner"
require_relative "../transaction_helper"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Discussions < Seeds::Runner
      extend T::Sig

      sig { returns String }
      def self.help
        <<~HELP
        Seed Discussions into new or preexisting repositories.

        If a repository nwo is provided, ensures that it exists, creating it
        if not. Enables the per-repo discussions setting. Creates a set of
        verified users to use as participants. Generates a set of discussions
        and comments.

        Count parameters may be specified as exact counts (-count variants) or as ranges
        (-min and -max variants). If a range is given, the count will be chosen uniformly
        from that range each time it's used.

        The seed parameter can be specified to create deterministic data.

        The convert-issues flag can be specified to convert a random subset of existing
        issues to discussions rather than just creating new discussions.

        The link-issues flag can be specified to link a random subset of existing
        issues to discussions, to represent issues being created from discussions.

        The refer-in-issues-prs flag can be specified to update the body of random
        issues and PRs with links to discussions.
        HELP
      end

      class Distribution
        extend T::Sig

        sig { params(min: Integer, max: Integer).void }
        def initialize(min:, max:)
          @min = min
          @max = max
        end

        sig { returns Integer }
        def next
          if @min == @max
            @min
          else
            @min + rand(@max - @min)
          end
        end

        sig do
          params(
            options: T::Hash[String, T.untyped],
            prefix: String,
            default_max: Integer,
            default_min: Integer
          ).returns(T.nilable(Distribution))
        end
        def self.from_options(options, prefix:, default_max:, default_min: 0)
          count, min, max = ["#{prefix}-count", "#{prefix}-min", "#{prefix}-max"].map { |opt| options[opt] }

          if count && (min || max)
            $stderr.puts "You may only specify one of --#{prefix}-count or --#{prefix}-min and -max."
            nil
          elsif count
            new(min: count, max: count)
          else
            min ||= default_min
            max ||= default_max
            new(min: min, max: max)
          end
        end
      end

      def self.subset_of_issue_ids_without_discussion_events(repo, rng: Random.new)
        issue_ids_converted_to_discussion = IssueEvent.where(repository: repo)
          .where(event: "converted_to_discussion")
          .pluck(:issue_id)
        issue_ids_created_from_discussion = DiscussionEvent
          .where(repository: repo, event_type: :created_issue)
          .pluck(:issue_id)
        issue_ids_with_discussion_events = [*issue_ids_converted_to_discussion, *issue_ids_created_from_discussion]

        open_issue_ids_without_discussion_event = repo.issues
          .where.not(id: issue_ids_with_discussion_events)
          .where(state: "open", pull_request_id: nil)
          .pluck(:id)
        closed_issue_ids_without_discussion_event = repo.issues
          .where.not(id: issue_ids_with_discussion_events)
          .where(state: "closed", pull_request_id: nil)
          .pluck(:id)
        issues_without_discussion_events_count =
          open_issue_ids_without_discussion_event.count + closed_issue_ids_without_discussion_event.count

        issues_to_couple_to_discussions_count = if issues_without_discussion_events_count > 0
          rng.rand(1..(issues_without_discussion_events_count / 2.0).ceil)
        else
          0
        end

        [open_issue_ids_without_discussion_event.sample(issues_to_couple_to_discussions_count, random: rng),
          closed_issue_ids_without_discussion_event.sample(issues_to_couple_to_discussions_count, random: rng)]
      end

      sig do
        params(
          repo: Repository,
          convertable_issue_ids: Array,
          participants: T::Array[User],
          categories: ActiveRecord::AssociationRelation,
          convert_issues: T.nilable(T::Boolean),
          rng: Random
        ).returns([Discussion, T::Boolean])
      end
      def self.generate_discussion(repo, convertable_issue_ids, participants, categories, convert_issues, rng: Random.new)
        convert_issue_to_discussion = convert_issues && convertable_issue_ids.count > 0
        if convert_issue_to_discussion
          issue_id_to_convert = convertable_issue_ids.delete_at(rng.rand(convertable_issue_ids.length))
          issue_to_convert = repo.issues.find_by(id: issue_id_to_convert)

          converter = IssueToDiscussionConverter.new(issue_to_convert, actor: issue_to_convert&.user)
          converter.prepare_for_conversion
          converter.finish_conversion

          [converter.discussion, true]
        else
          [::Discussion.create!(
            repository: repo,
            user: participants.sample,
            title: Faker::Lorem.question,
            body: Faker::Lorem.paragraphs(number: 1 + rng.rand(3)).join("\n\n"),
            category: categories.sample,
          ), false]
        end
      end

      sig do
        params(
          repo: Repository,
          discussion: Discussion,
          open_issue_ids_without_discussion_events: T::Array[Integer],
          closed_issue_ids_without_discussion_events: T::Array[Integer],
          rng: Random
        ).returns(T.nilable(T::Boolean))
      end
      def self.link_to_issue(repo, discussion, open_issue_ids_without_discussion_events, closed_issue_ids_without_discussion_events, rng: Random.new)
        all_issues_without_discussion_events = [
          *open_issue_ids_without_discussion_events,
          *closed_issue_ids_without_discussion_events
        ]
        link_issue_to_discussion = all_issues_without_discussion_events.count > 0
        if link_issue_to_discussion
          issue_id_index = rng.rand(all_issues_without_discussion_events.length)
          issue_id_to_link = T.must(all_issues_without_discussion_events[issue_id_index])
          open_issue_ids_without_discussion_events.delete(issue_id_to_link)
          closed_issue_ids_without_discussion_events.delete(issue_id_to_link)

          issue_to_link = repo.issues.find_by(id: issue_id_to_link)
          event = DiscussionEvent.new(discussion: discussion, issue_id: issue_to_link&.id, actor: issue_to_link&.user,
            event_type: :created_issue)
          event.save
        end
      end

      sig { params(repo: Repository, discussion: Discussion, rng: Random).void }
      def self.refer_in_pr_issue(repo, discussion, rng: Random.new)
        refer_in_pr = repo.pull_requests.count > 0
        if refer_in_pr
          pr_ids_to_refer_in = repo.pull_requests
                                .pluck(:id)
                                .sample(rng.rand(1..(repo.pull_requests.count / 2.0).ceil), random: rng)
          pr_ids_to_refer_in.each do |pr_id|
            pr = repo.pull_requests.find_by(id: pr_id)
            pr_issue = pr&.issue
            pr_issue.update!(body: "#{pr_issue.body}\n\nAssociated discussion ##{discussion.number}") if pr_issue
          end
        end

        issues_count = repo.issues.where(pull_request_id: nil).count
        refer_in_issue = issues_count > 0
        if refer_in_issue
          issue_ids_to_refer_in = repo.issues
                                    .where(pull_request_id: nil)
                                    .pluck(:id)
                                    .sample(rng.rand(1..(issues_count / 2.0).ceil), random: rng)
          issue_ids_to_refer_in.each do |issue_id|
            issue = repo.issues.find_by(id: issue_id)
            issue.update!(body: "#{issue.body}\n\nAssociated discussion ##{discussion.number}") if issue
          end
        end
      end

      sig { params(options: T::Hash[String, T.untyped]).void }
      def self.run(options = {})
        rng = options["seed"] ? Random.new(options["seed"].to_i) : Random.new
        Faker::Config.random = rng

        comment_dist = Distribution.from_options(options, prefix: "comment", default_min: 0, default_max: 10)
        thread_dist = Distribution.from_options(options, prefix: "thread", default_min: 0, default_max: 5)
        return 1 if [comment_dist, thread_dist].any? { |dist| dist.nil? }
        comment_dist = T.must(comment_dist)
        thread_dist = T.must(thread_dist)

        discussion_count = options["discussion-count"]
        repo_nwo = options["repo"] || "monalisa/smile"
        puts "-> Seeding repo '#{repo_nwo}' with #{discussion_count} discussions."

        # Discussion participants.
        participant_count = options["participant-count"]
        create_participants = options["create-participants"]

        puts "  -> Locating #{participant_count} users to use as discussion participants."
        participants = create_participants ? [] : User.has_verified_email.not_suspended.last(participant_count)
        (participants.size + 1).upto(participant_count) do |n|
          participants << Seeds::Objects::User.create(login: "#{Faker::Name.first_name.downcase}#{n}").tap do |user|
            puts "  -> Created participant @#{user.login}."
          end
        end

        # Repository.
        puts "  -> Setting up repository."
        repo = Seeds::Objects::Repository.create_with_nwo(nwo: repo_nwo, setup_master: true, is_public: true)
        repo.turn_on_discussions(actor: repo.owner, instrument: false)
        puts "  -> Set up repository #{repo.nwo}."

        # Discussions.
        categories = repo.discussion_categories.where.not(name: %w[Announcements Polls])
        discussion_batch_size = 5
        open_issue_ids_without_discussion_events, closed_issue_ids_without_discussion_events =
          subset_of_issue_ids_without_discussion_events(repo, rng: rng)

        puts "  -> Generating #{discussion_count} discussions."
        batch_callback = lambda do |batch_size|
          puts "   -> Commiting #{batch_size} new discussion(s)."
        end

        TransactionHelper.repeat_in_batches_with_transaction(
          batch_size: discussion_batch_size,
          times: discussion_count,
          record: ::Discussion,
          batch_callback: batch_callback
        ) do
          discussion, converted_from_issue = generate_discussion(
            repo,
            open_issue_ids_without_discussion_events,
            participants,
            categories,
            options["convert-issues"]
          )

          if !converted_from_issue && options["link-issues"]
            link_to_issue(
              repo,
              discussion,
              open_issue_ids_without_discussion_events,
              closed_issue_ids_without_discussion_events
            )
          end

          if options["refer-in-issues-prs"]
            refer_in_pr_issue(repo, discussion, rng: rng)
          end

          reaction_content = Emotion.all.map(&:content)
          participants.each do |participant|
            next if participant == discussion.user
            next if [true, false].sample

            ::DiscussionVote.create!(
              discussion: discussion,
              user: participant,
              upvote: 1,
            )

            ::DiscussionReaction.create!(
              discussion_id: discussion.id,
              user: participant,
              content: reaction_content.sample
            )
          end

          comment_dist.next.times do
            comment = ::DiscussionComment.create!(
              discussion: discussion,
              user: participants.sample,
              body: Faker::Lorem.paragraphs(number: 1 + rand(2)).join("\n\n"),
            )

            participants.each do |participant|
              next if participant == comment.user
              next if [true, false].sample

              ::DiscussionCommentVote.create!(
                discussion: discussion,
                comment: comment,
                user: participant,
                upvote: 1,
              )
            end

            thread_dist.next.times do
              ::DiscussionComment.create!(
                discussion: discussion,
                parent_comment: comment,
                user: participants.sample,
                body: Faker::Lorem.paragraphs(number: 1 + rand(2)).join("\n\n"),
              )
            end
          end

          $stdout.flush
        end

        puts "-> Completed creation of discussions."

        puts "-> Enabling feature flags for Copilot discussions summaries."

        %w(
          discussions_copilot_summary
          copilot_api_agents
          copilot_api_platform_agent
          copilot_summary_custom_prompt
        ).each do |feature_flag|
          puts "Enabling #{feature_flag} feature..."
          Seeds::Objects::FeatureFlag.enable(feature_flag: feature_flag)
        end

        puts "-> Done enabling feature flags!"
      end
    end
  end
end
