# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Feeds < Seeds::Runner
      # TODO:
      # Repo cases - https://github.com/github/feeds/issues/468
      # User cases - https://github.com/github/feeds/issues/469
      # Recommended cases - https://github.com/github/feeds/issues/470
      USER_COUNT = 8
      NEWLY_SPONSORABLE_COUNT = 1
      NEAR_SPONSORS_GOAL_COUNT = 1
      RELEASE_COUNT = 1
      PRS_PER_RELEASE = 3
      LANGUAGES = ["js", "ts", "rb", "go", "py", "java", "c", "c++", "c#", "php", "html", "css"].freeze

      def self.help
        <<~HELP
        Seeds feed items for local development. Feed items include
        - Discussion: announcement
        - Repo: release
        - Repo: star
        - Repo: created
        - Repo: long name
        - Repo: added to user list
        - Release: star
        - Release: truncated body
        - Release: no truncated body
        - Pull Request:
          - pr is merged, has 1+ reviews
          - author does not have write access; is not a bot
          - repo is public; has more than 2 stars +
        - Users
        HELP
      end

      def self.mona
        Seeds::Objects::User.monalisa
      end

      # currently, primary_avatar_url doesn't do anything, but maybe one day if
      # we can set avatar urls directly on the user
      def self.create_feed_user(login:, email: nil, primary_avatar_url: "", **opts)
        user = ::User.find_by(login: login)
        return user if user

        email = email || Faker::Internet.unique.email

        user = Seeds::Objects::User.create(login: login, email: email, **opts)
        puts "CREATED_USER: #{user.login}"

        user
      end

      def self.create_filler_users
        trainers = [{
          login: "ashketchum",
          email: "ash@ketchum.com",
          primary_avatar_url: "https://img.pokemondb.net/sprites/home/normal/pikachu-original-cap.png",
        },
        {
          login: "misty",
          email: "kasumi@ceruleangym.com",
          primary_avatar_url: "https://img.pokemondb.net/sprites/trainers/firered-leafgreen/misty.png",
        },
        {
          login: "garyoak",
          email: "ash@sux.com",
          primary_avatar_url: "https://img.pokemondb.net/sprites/trainers/firered-leafgreen/blue.png"
        }]

        users = {}
        trainers.each do |trainer|
          user = ::User.find_by(login: trainer[:login]) || create_feed_user(**trainer)
          users[trainer[:login]] = user
        end

        users
      end

      def self.add_members_to_org(org, members: [])
        if members.empty?
          USER_COUNT.times do |_i|
            members << Faker::Games::Pokemon.unique.name
          end
        end
        members.count do |member|
          user = create_feed_user(
            login: member.gsub(/\W|-/, "").downcase,
            # primary_avatar_url: "https://img.pokemondb.net/sprites/home/#{shiny ? 'shiny' : 'normal'}/#{mon.downcase}.png"
          )

          org.add_member(user)
        end
      end

      def self.create_filler_orgs
        leaders = [{
          login: "brock",
          email: "brock@boulder.com",
          primary_avatar_url: "https://img.pokemondb.net/sprites/trainers/heartgold-soulsilver/brock.png",
          orgname: "pewter-gym",
          members: %w[geodude onix]
        },
        {
          login: "surge",
          email: "lt@surge.com",
          primary_avatar_url: "https://img.pokemondb.net/sprites/trainers/heartgold-soulsilver/lt-surge.png",
          orgname: "vermillion-gym",
          members: %w[voltorb raichu]
        },
        {
          login: "sabrina",
          email: "spookysabrina@sc.net",
          primary_avatar_url: "https://img.pokemondb.net/sprites/trainers/firered-leafgreen/sabrina.png",
          orgname: "saffron-gym",
          members: %w[kadabra alakazam]
        },
        {
          login: "falkner",
          email: "ilovebirds@vc.com",
          primary_avatar_url: "https://img.pokemondb.net/sprites/trainers/heartgold-soulsilver/falkner.png",
          orgname: "violet-gym",
          members: %w[pidgey pidgeotto]
        },
        {
          login: "blaine",
          email: "hotdiggitydog@lava.com",
          primary_avatar_url: "https://img.pokemondb.net/sprites/trainers/firered-leafgreen/blaine.png",
          orgname: "cinnabar-gym",
          members: %w[vulpix ponyta]
        }]

        orgs = {}
        leaders.each do |leader|
          u = create_feed_user(login: leader[:login], email: leader[:email], primary_avatar_url: leader[:primary_avatar_url])
          org = ::Organization.find_by(login: leader[:orgname]) || Seeds::Objects::Organization.create(login: leader[:orgname], admin: u)

          self.add_members_to_org(org, members: leader[:members])
          orgs[leader[:orgname]] = org
        end

        orgs
      end

      def self.create_repo_for(owner:, repo_opts: {})
        repo = Seeds::Objects::Repository.create(
          owner_name: owner.login,
          repo_name: repo_opts[:name] || "#{repo_opts[:public] ? 'public-' : ''}#{Faker::Internet.slug(words: Faker::Games::Pokemon.unique.move, glue: "-")}",
          setup_master: true,
          is_public: repo_opts[:public] || true,
          description: repo_opts[:description]
        )
        puts "CREATED_REPO: #{repo.nwo}"

        committer = owner.is_a?(Seeds::Objects::Organization) ? owner.members.sample : owner

        Seeds::Objects::Commit.create(
          repo: repo,
          message: "Adding yml config",
          committer: committer,
          files: { "#{Release::ReleaseNotes::RELEASE_NOTES_CONFIG_PATHS[0]}" => { "changelog" => { "categories" => [] } }.to_yaml }
        )

        language = repo_opts[:language] || Faker::ProgrammingLanguage.name.downcase
        if language
          Seeds::Objects::Commit.create(
            repo: repo,
            committer: committer,
            branch_name: repo.default_branch,
            files: { "file.#{language}" => "# File\n\nthis is a file" },
            message: "New commit - add file.#{language}.",
          )
          puts "Adds random #{language} language file to repo: #{repo.nwo}"
        end

        repo
      end

      def self.setup_sponsor_and_sponsorable(sponsor:, sponsorable:, opts: {})
        unless sponsorable.all_active_sponsors.include?(sponsor) || sponsorable.sponsors_listing.present?
          listing = FactoryBot.create(:sponsors_listing,
            opts["newly_sponsorable"] ? :pending_approval : :approved,
            :with_w8_or_w9_verified_stripe_account,
            tier_count: 4,
            sponsorable: sponsorable,
          )

          if opts["newly_sponsorable"]
            listing.actor = sponsorable # correct actor doesn't matter here.
            listing.approve!(automated: false)
            puts "NEWLY_SPONSORABLE -> #{sponsorable.login}"
          end

          if opts["near_sponsors_goal"]
            # near sponsor goal
            sponsor_goal = FactoryBot.create(:sponsors_goal,
              listing: listing,
              target_value: listing.sponsors_tiers.last.monthly_price_in_dollars.to_i + 1,
              kind: :monthly_sponsorship_amount)

            puts "NEAR_SPONSORS_GOAL -> #{sponsorable.login}"
          end

          if sponsor.plan_subscription.blank?
            sponsor.billing_type = "card"
            sponsor.customer_account = FactoryBot.create(:credit_card_customer_account, user: sponsor)
            sponsor.plan_subscription = FactoryBot.create(:billing_plan_subscription)
            sponsor.save!
          end

          sponsorship = FactoryBot.create(
            :sponsorship,
            :with_billing_transaction_and_line_item,
            :unpaid,
            tier: listing.sponsors_tiers.last,
            sponsorable: sponsorable,
            sponsor: sponsor,
          )

          # we need to instrument this so Conduit creates the event
          sponsorship.instrument_payment_complete(tier_paid: sponsorship.tier,
            via_bulk_sponsorship: false)

          puts "SPONSOR_USER: #{sponsor.login} <-> #{sponsorable.login}"
        end
      end

      def self.add_to_user_list(name, user:, description: nil, repository: nil)
        slug = UserList.slug_for_name(name)
        user_list = UserList.find_by(slug: slug, user: user)

        unless user_list
          puts "- Creating user list '#{name}' for #{user}"
          user_list = FactoryBot.create(:user_list, name: name, user: user, description: description)
        end

        list_repo_ids = user_list.repositories.pluck(:id)
        if repository && !list_repo_ids.include?(repository.id)
          FactoryBot.create(:user_list_item, user_list: user_list, repository: repository)
        end

        user_list
      end

      # https://github.com/github/feeds/issues/469
      def self.create_user_cases
        # user without name
        # user without bio
        noname = create_feed_user(login: "nonameuser", email: "noname@user.com")

        # user with name
        with_name = create_feed_user(login: "withnameuser", email: "with_name@user.com")
        with_name.profile_name = Faker::Name
        with_name.save!

        # user with bio (with mention in bio)
        with_bio = create_feed_user(login: "withbiouser", email: "with_bio@user.com")
        with_bio.profile_bio = "This is a bio with a mention shoutout to the homie @ashketchum"
        with_bio.save!

        # user with looooooooong display name
        # Follower user with looooooooong bio
        long_name = create_feed_user(login: "longnameuser", email: "long_name@user.com")
        long_name.profile_name = Faker::Name.name_with_middle + Faker::Name.name_with_middle + Faker::Name.name_with_middle
        long_name.profile_bio = Faker::Lorem.characters(number: 50) + Faker::Lorem.characters(number: 50)
        long_name.save!

        # user with pronouns
        pronoun_user = create_feed_user(login: "pronounuser", email: "pronouns@user.com")
        pronoun_user.profile_pronouns = "pronoun/pronouns"
        pronoun_user.profile_name = "Pro Nowns"
        pronoun_user.profile_bio = "Pronouns are my life"
        pronoun_user.save!

        {
          noname: noname,
          with_name: with_name,
          with_bio: with_bio,
          long_name: long_name,
          pronoun_user: pronoun_user,
        }
      end

      # https://github.com/github/feeds/issues/468
      def self.create_repo_cases(owner:)
        return unless owner
        long_name = create_repo_for(
          owner: owner,
          repo_opts: {
            name: ""\
            "#{ Faker::Lorem.characters(number: 30)}"\
            "-#{ Faker::Lorem.characters(number: 45)}",
            description: "A repo with a long name",
            language: LANGUAGES.sample
          }
        )
        with_desc = create_repo_for(
          owner: owner,
          repo_opts: {
            name: "with-desc-repo",
            description: Faker::Hacker.say_something_smart,
            language: LANGUAGES.sample
          }
        )
        trunc_desc = create_repo_for(
          owner: owner,
          repo_opts: {
            name: "truncated-desc-repo",
            description: "#{Faker::Hacker.say_something_smart}"\
            "#{Faker::Lorem.paragraph(sentence_count: 10)}".truncate(Repository::DESCRIPTION_CHAR_LIMIT),
            language: LANGUAGES.sample
          }
        )
        no_desc = create_repo_for(
          owner: owner,
          repo_opts: {
            name: "no-desc-repo",
            language: LANGUAGES.sample,
            description: ""
          }
        )
        # Created repo with 1+ stargazers
        stargazer_repo = create_repo_for(
          owner: owner,
          repo_opts: {
            name: "stargazer-repo",
            language: LANGUAGES.sample
          }
        )
        mona.star(stargazer_repo)

        no_lang = create_repo_for(
          owner: owner,
          repo_opts: {
            name: "no-lang-repo",
            description: "I have no language."
          }
        )
        to_be_deleted = create_repo_for(
          owner: owner,
          repo_opts: {
            name: "byebye"
          }
        )

        {
          long_name: long_name,
          with_desc: with_desc,
          trunc_desc: trunc_desc,
          no_desc: no_desc,
          stargazer_repo: stargazer_repo,
          no_lang: no_lang,
          to_be_deleted: to_be_deleted,
        }
      end

      def self.enable_for_mona_feed(*users)
        users.flatten.each do |user|
          mona.follow(user)

          puts "ENABLED FOR MONA FEED: #{user}"
        end
      end

      def self.generate_followed_user_card(user, followed_user)
        user.follow(followed_user)

        puts "FOLLOWED USER CARD: #{user.login} -> #{followed_user.login}"
      end

      def self.collaborate_with_mona(*users)
        collab_repo = create_repo_for(owner: mona, repo_opts: { name: "collaboration-station", language: LANGUAGES.sample, description: "A repo to collaborate" })

        users.flatten.each do |user|
          Objects::Commit.create(
            repo: collab_repo,
            committer: user,
            branch_name: collab_repo.default_branch,
            files: { "#{Faker::Internet.slug(words: Faker::Games::Pokemon.move, glue: "-")}.#{LANGUAGES.sample}" => "# File\n\nthis is a collaborative file" },
            message: Faker::TvShows::RuPaul.quote,
          )
          puts "MERGED_PR: by #{user} to #{collab_repo}"
          Objects::Release.create_merged_pr(collab_repo, user: user)

          puts "PUBLISH HYDRO EVENT: Add collaboration between mona and #{user}"
          message = {
            actor_id: mona.id,
            relationship: "COLLABORATED",
            resource_type: "USER",
            resource_id: user.id,
            change_type: "ADDED",
            active_at: Time.now,
            variable_weight: 1
          }
          GitHub.hydro_publisher.publish(message, schema: "github.feeds.v0.ImplicitRelationshipChanged")

          puts "COLLABORATED WITH MONA: #{user}"
        end
      end

      def self.generate_newly_sponsorable_card(sponsor: nil, sponsorable: nil)
        new_sponsor = sponsor || create_feed_user(
          login: "newsponsor-" + Faker::Creature::Animal.name.gsub(/\W|-/, "").downcase,
          email: "newsponsor" + Faker::Internet.unique.email,
        )

        newly_sponsorable_followed_user = sponsorable || create_feed_user(
          login: "newsponsee-" + Faker::Creature::Animal.name.gsub(/\W|-/, "").downcase,
          email: "newsponsee" + Faker::Internet.unique.email,
        )

        new_sponsor.follow(newly_sponsorable_followed_user)

        setup_sponsor_and_sponsorable(sponsor: new_sponsor, sponsorable: newly_sponsorable_followed_user, opts: { "newly_sponsorable" => true })

        puts "NEWLY SPONSORABLE USER CARD: #{new_sponsor.login} -> #{newly_sponsorable_followed_user.login}"
      end

      def self.generate_near_sponsors_goal_card(sponsor: nil, sponsorable: nil)
        new_sponsor = sponsor || create_feed_user(
          login: "nearsponsor-" + Faker::Creature::Animal.name.gsub(/\W|-/, "").downcase,
          email: "nearsponsor" + Faker::Internet.unique.email,
        )
        near_sponsors_goal_followed_user = sponsorable || create_feed_user(
          login: "nearsponsee-" + Faker::Creature::Animal.name.gsub(/\W|-/, "").downcase,
          email: "nearsponsee" + Faker::Internet.unique.email,
        )

        new_sponsor.follow(near_sponsors_goal_followed_user)

        mona.follow(near_sponsors_goal_followed_user)
        mona.follow(new_sponsor)
        puts "FOLLOWED_USER: mona -> #{near_sponsors_goal_followed_user.login}"
        puts "FOLLOWED_USER: mona -> #{new_sponsor.login}"

        setup_sponsor_and_sponsorable(sponsor: new_sponsor, sponsorable: near_sponsors_goal_followed_user, opts: { "near_sponsors_goal" => true })

        puts "NEAR SPONSORS GOAL CARD: #{near_sponsors_goal_followed_user.login}"
      end

      def self.generate_sponsored_user_card(sponsor: nil, sponsee: nil)
        new_sponsor = sponsor || create_feed_user(
          login: Faker::Movies::HarryPotter.character.gsub(/\W|-/, "").downcase
        )
        new_sponsee = sponsee || create_feed_user(
          login: Faker::Movies::HarryPotter.character.gsub(/\W|-/, "").downcase
        )

        new_sponsor.follow(new_sponsee)

        setup_sponsor_and_sponsorable(sponsor: new_sponsor, sponsorable: new_sponsee)
        puts "SPONSORED USER CARD: #{new_sponsee.login}"
      end

      def self.generate_discussion_announcement_card(repository:, **opts)
        # enable discussions for repo
        repository.turn_on_discussions(actor: repository.owner, instrument: false)

        # Discussion from a followed user with truncated body
        discussion = ::Discussion.create!(
          repository: repository,
          user: repository.owner,
          title: Faker::Games::WorldOfWarcraft.quote,
          body: Faker::Markdown.sandwich(sentences: 5) + Faker::Lorem.paragraphs(number: 10 + rand(3)).join("\n\n"),
          category: repository.discussion_categories.where(name: "Announcements").first,
          **opts
        )

        discussion
      end

      def self.run(options = {})
        # Required to use FactoryBot
        require_relative "../factory_bot_loader"

        # Prevent collisions with generated names for eg. repos
        Faker::Internet.unique.clear
        Faker::Games::Pokemon.unique.clear

        joe = create_feed_user(login: "joe", email: "joe@mojo.com")
        enable_for_mona_feed(joe)
        generate_followed_user_card(joe, mona)

        users = create_user_cases
        repos = create_repo_cases(owner: joe)

        users.values.each do |user|
          if [true, false].sample
            generate_followed_user_card(joe, user)
          else
            generate_newly_sponsorable_card(sponsor: joe, sponsorable: user)
          end
        end

        create_feed_filler(options)

        puts "Seeding data complete 🌱"
      end

      def self.create_feed_filler(options = {})
        puts "### generating users and orgs"
        users = create_filler_users
        orgs = create_filler_orgs

        followed_org_admin = users["ashketchum"]
        unfollowed_user = users["misty"]
        sponsorable = users["garyoak"]

        org = Seeds::Objects::Organization.create(login: "ashteam", admin: followed_org_admin)
        add_members_to_org(org, members: %w[pikachu charmander squirtle bulbasaur])

        gym_org = orgs.values.sample
        add_members_to_org(gym_org, members: %w[moltres zapdos articuno])

        enable_for_mona_feed(followed_org_admin)

        puts "### generating Sponsor cards"
        puts "#### Sponsored User"
        generate_sponsored_user_card(sponsor: followed_org_admin, sponsee: sponsorable)

        # ash follows a bunch of people for rolling up
        orgs[orgs.keys.sample].members.map do |user|
          followed_org_admin.follow(user)
        end

        # sponsors
        setup_sponsor_and_sponsorable(sponsor: followed_org_admin, sponsorable: sponsorable)
        setup_sponsor_and_sponsorable(sponsor: mona, sponsorable: unfollowed_user, opts: { "newly_sponsorable" => true })

        # Newly Sponsorable
        NEWLY_SPONSORABLE_COUNT.times do |i|
          new_sponsor = Seeds::Objects::User.create(
            login: "newsponsor-" + Faker::Creature::Animal.name.gsub(/\W|-/, "").downcase,
            email: "newsponsor" + Faker::Internet.unique.email,
          )

          newly_sponsorable_followed_user = Seeds::Objects::User.create(
            login: "newsponsee-" + Faker::Creature::Animal.name.gsub(/\W|-/, "").downcase,
            email: "newsponsee" + Faker::Internet.unique.email,
          )
          puts "created newly sponsorable user #{i + 1} / #{NEWLY_SPONSORABLE_COUNT}: #{newly_sponsorable_followed_user}"

          new_sponsor.follow(newly_sponsorable_followed_user)
          mona.follow(newly_sponsorable_followed_user)
          puts "FOLLOWED_USER: #{new_sponsor} -> #{newly_sponsorable_followed_user.login}"
          puts "FOLLOWED_USER: mona -> #{newly_sponsorable_followed_user.login}"
          setup_sponsor_and_sponsorable(sponsor: new_sponsor, sponsorable: newly_sponsorable_followed_user, opts: { "newly_sponsorable" => true })
        end

        puts "#### Near Sponsors Goal"
        (options[:near_sponsors_goal_count] || NEAR_SPONSORS_GOAL_COUNT).times do |_i|
          generate_near_sponsors_goal_card
        end

        puts "### generating Star cards"
        public_repo = create_repo_for(owner: org, repo_opts: { language: LANGUAGES.sample, description: Faker::TvShows::Friends.quote })
        public_repo.add_members(org.members)

        move_repo = create_repo_for(owner: sponsorable, repo_opts: { language: LANGUAGES.sample, description: Faker::TvShows::RuPaul.quote })


        orgs[orgs.keys.sample].members.sample(3).map do |user|
          # have Ash star a few repos in a row to ensure they will be rolled up
          repo = create_repo_for(owner: user, repo_opts: { language: LANGUAGES.sample, description: Faker::TvShows::Friends.quote })
          followed_org_admin.star(repo)
          puts "Ashketchum starred #{repo}"
        end

        starred_public_repo = create_repo_for(
          owner: unfollowed_user,
          repo_opts: {
            name: "by-misty-#{Faker::Internet.slug(words: Faker::Games::Pokemon.move, glue: "-")}",
            language: LANGUAGES.sample
          }
        )

        long_name_repo = create_repo_for(
          owner: unfollowed_user,
          repo_opts: {
            name: "by-misty-"\
                  "-#{Faker::Internet.slug(words: Faker::Games::Pokemon.move, glue: "-")}"\
                  "-#{ Faker::Lorem.characters(number: 45)}",
            description: "A repo with a long name"
          }
        )
        puts "#### Starred Repository"
        followed_org_admin.star(public_repo)
        puts "STARRED_REPO: #{followed_org_admin} <-> #{public_repo.nwo}"

        mona.star(starred_public_repo)
        puts "STARRED_REPO: mona <-> #{starred_public_repo}"

        mona.star(long_name_repo)
        puts "STARRED_REPO: mona <-> #{long_name_repo}"

        puts "#### Rollup - Starred Repository"
        orgs[orgs.keys.sample].members.sample(3).map do |user|
          # have Ash star a few repos in a row to ensure they will be rolled up
          repo_name = Faker::Internet.slug(words: Faker::Games::Pokemon.move, glue: "-")
          repo = create_repo_for(owner: user, repo_opts: { language: LANGUAGES.sample, repo_name: repo_name, description: Faker::TvShows::Friends.quote })
          followed_org_admin.star(repo)
          puts "Ashketchum starred #{repo}"
        end

        puts "#### Added to List"
        user_list = add_to_user_list("Mona's List", user: mona, repository: public_repo)
        puts "ADDED_TO_LIST: #{public_repo} -> #{user_list.name}"

        user_list = add_to_user_list("Mona's List", user: mona, repository: starred_public_repo)
        puts "ADDED_TO_LIST: #{starred_public_repo} -> #{user_list.name}"

        fav_moves_list = add_to_user_list("Favorite Moves :fire:", user: followed_org_admin, description: "I got the moves.", repository: move_repo)
        puts "ADDED_TO_LIST: #{move_repo} -> #{fav_moves_list.name}"

        puts "### generating Repository cards"
        puts "#### Created Repository"
        orgs.each do |_org_login, org|
          member = org.members.sample
          enable_for_mona_feed(member)

          create_repo_for(owner: member, repo_opts: { language: LANGUAGES.sample, description: Faker::TvShows::Friends.quote })

          puts "CREATED_REPO: #{member.repositories.last.nwo}"
        end

        puts "#### Merged PR"
        non_bot_user_outside_org = create_feed_user(
          login: "idkpokemoncharacters",
          email: "pokemon_" + Faker::Internet.unique.email,
          primary_avatar_url: "https://en.wikipedia.org/wiki/Office_Assistant#/media/File:Windows_11_Clippy_paperclip_emoji.png"
        )
        puts "Created user: #{non_bot_user_outside_org}"

        non_bot_user_outside_org.star(starred_public_repo)
        puts "STARRED_REPO: #{non_bot_user_outside_org} <-> #{starred_public_repo}"

        enable_for_mona_feed(non_bot_user_outside_org)
        collaborate_with_mona(non_bot_user_outside_org)
        starred_public_repo.add_member(non_bot_user_outside_org)

        os_pr = Seeds::Objects::PullRequest.create(repo: starred_public_repo, committer: non_bot_user_outside_org)
        pr_review = Seeds::Objects::PullRequestReview.create(pull_request: os_pr, user: mona, state: :approved)
        puts "CREATED_PULL_REQUEST: #{os_pr.repository.nwo} by #{non_bot_user_outside_org}"

        os_pr.merge
        puts "MERGED_PUBLIC_PR: #{os_pr.title} created by #{non_bot_user_outside_org}"

        puts "### generating Release cards"
        Seeds::Objects::Release.enable_repo_for_releases_in_feed(public_repo)

        gym_release_author = gym_org.members.sample
        enable_for_mona_feed(gym_release_author)

        gym_release_repo = create_repo_for(owner: gym_org, repo_opts: { language: "java" })
        gym_release_repo.add_members(gym_org.members)
        (options[:release_count] || RELEASE_COUNT).times {
          Seeds::Objects::Release.add_prs_and_release_new_version(
            PRS_PER_RELEASE,
            repo: gym_release_repo,
            release_author: gym_release_author
          )
        }
        puts "PUBLISHED_RELEASE: #{gym_release_author} <-> #{gym_release_repo}"

        # Starred repo release
        Objects::Release.create(
          repo: starred_public_repo,
          release_author: unfollowed_user,
          name: "#{Faker::Games::Pokemon.location} release from starred repo by unfollowed author",
          tag_name: "v#{Faker::Number.number(digits: 2)}",
          body: Faker::Lorem.paragraphs(number: 1 + rand(3)).join("\n\n"),
        )
        puts "PUBLISHED_RELEASE: #{starred_public_repo} <-> #{unfollowed_user}"

        # Release with 6+ contributors
        puts "Preparing release with 6+ contributors"
        release_author = org.members.sample
        enable_for_mona_feed(release_author)
        collaborate_with_mona(release_author)

        public_repo.members.each { |member|
          Objects::Commit.create(
            repo: public_repo,
            committer: member,
            branch_name: public_repo.default_branch,
            files: { "#{Faker::Internet.slug(words: Faker::Games::Pokemon.move, glue: "-")}.#{LANGUAGES.sample}" => "# File\n\nthis is a file" },
            message: Faker::TvShows::RuPaul.quote,
          )
          puts "MERGED_PR: by #{member} to #{public_repo}"
          Objects::Release.create_merged_pr(public_repo, user: member)
        }

        Objects::Release.create(
          repo: public_repo,
          release_author: release_author,
          tag_name: "v#{Faker::App.semantic_version}"
        )
        puts "PUBLISHED_RELEASE: #{public_repo} <-> #{release_author} - 6+ contributors"

        # Release with truncated body
        Objects::Release.create(
          repo: public_repo,
          release_author: release_author,
          tag_name: Faker::App.semantic_version,
          body: Faker::Lorem.paragraphs(number: 20 + rand(3)).join("\n\n"),
          name: "release with truncated body #{Faker::Company.catch_phrase} #{Faker::Company.bs}",
        )
        puts "PUBLISHED_RELEASE: #{public_repo} <-> #{release_author} - truncated body"

        # Release with no truncated body
        Objects::Release.create(
          repo: public_repo,
          release_author: release_author,
          tag_name: "v99",
          body: Faker::Lorem.paragraphs(number: 1 + rand(3)).join("\n\n"),
          name: "#{Faker::Games::Pokemon.location} release with no truncated body",
        )
        puts "PUBLISHED_RELEASE: #{public_repo} <-> #{release_author} - no truncated body"

        # Release to be deleted
        release_to_be_deleted = Objects::Release.create(
          repo: public_repo,
          release_author: release_author,
          tag_name: "v#{Faker::Number.number(digits: 2)}",
          body: "This release should be deleted",
          name: "Release to be deleted",
        )
        puts "PUBLISHED_RELEASE: #{public_repo} <-> #{release_author} #{release_to_be_deleted.tag_name}- to be deleted"
        release_to_be_deleted.delete
        puts "deleted release: #{release_to_be_deleted.tag_name}"

        # Release from starred repo published by a bot
        bot = Bot.find_by_login("release-buddy[bot]")
        if bot.nil?
          bot = Bot.new
          integration = ::Integration.new(name: "Release Buddy", bot: bot, url: "http://localhost:4567", owner: unfollowed_user)
          bot.integration = integration
          integration.save!
          bot.save!
          puts "Created bot: #{bot}"
        end

        Objects::Release.create(
          repo: starred_public_repo,
          release_author: bot,
          tag_name: "v#{Faker::Number.number(digits: 2)}",
          name: "#{Faker::Games::Pokemon.location} release from starred repo published by a bot",
        )
        puts "#{bot} created a new release for #{starred_public_repo.nwo}"

        puts "### generating Announcement cards"
        puts "#### Discussion for Repository"
        # Discussion from a followed user with truncated body
        generate_discussion_announcement_card(
          repository: public_repo,
          user: followed_org_admin,
          title: "BIG BATTLE: #{Faker::Games::Pokemon.name} VS #{Faker::Games::Pokemon.name}",
          body: Faker::Lorem.paragraphs(number: 10 + rand(3)).join("\n\n"),
        )

        puts "#### Discussion for Release"
        # Discussion from a followed user with upvotes and comments
        release = public_repo.releases.last
        announcement_for_release = generate_discussion_announcement_card(
          repository: public_repo,
          category: public_repo.discussion_categories.where(name: "Announcements").first,
          user: followed_org_admin,
          release: release,
        )

        ::DiscussionComment.create!(discussion: announcement_for_release, user: followed_org_admin, body: "first!")
        org.members.each { |member|
          announcement_for_release.upvote(member)
          ::DiscussionComment.create!(discussion: announcement_for_release, user: member, body: "Yay!")
          puts "#{member} upvoted and commented on announcement for release: #{release.tag_name}"
        }

        # Discussion announcement in a starred repo from unfollowed user, no truncated body
        generate_discussion_announcement_card(
          repository: starred_public_repo,
          user: unfollowed_user,
          title: "GYM VS GYM: #{Faker::Games::Pokemon.location}",
          body: Faker::Lorem.paragraphs(number: 1 + rand(3)).join("\n\n"),
        )

        # Deleted discussion from a followed user
        discussion_to_be_deleted = generate_discussion_announcement_card(
          repository: public_repo,
          user: followed_org_admin,
          title: "Deleted Discussion",
          body: "This will be deleted",
        )
        discussion_to_be_deleted.delete
        puts "Created and then deleted discussion: #{discussion_to_be_deleted.title}"
      end
    end
  end
end
