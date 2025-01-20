# typed: strict
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    extend T::Sig
    class Renderables < Seeds::Runner
      sig { returns(String) }
      def self.help
        <<~HELP
        Create renderables repo with all the file types that can be rendered by viewscreen or notebooks microservices.
        HELP
      end

      sig { params(options: T::Hash[Symbol, T.untyped]).void }
      def self.run(options = {})
        new.run
      end

      sig { void }
      def run
        repo = setup_renderables_repository
        mona = Objects::User.monalisa

        create_ipynb_prs(repo, mona)
        create_renderable_file_prs(repo, mona)
        diff_feature_preview(mona)
      end

      private

      sig { returns(Repository) }
      def setup_renderables_repository
        puts "Creating renderables repository..."

        rend = Repository.find_by(name: "renderables")
        if rend
          puts "removing existing renderables repo"
          rend.destroy!
        end

        Seeds::Objects::Repository.restore_premade_repo(
          owner_name: Objects::User.monalisa.login,
          repo_name: "renderables",
          location_premade_git: "test/fixtures/git/examples/renderable_files.git",
          is_public: true,
        )
      end

      sig { params(mona: User).void }
      def diff_feature_preview(mona)
        puts "Enabling ipynb-diff feature flag and feature preview..."
        feature_name = "ipynb-diff"

        if !FlipperFeature.find_by(name: feature_name)
          FlipperFeature.create(name: feature_name).enable(mona)
          puts "Created FlipperFeature: ipynb-diff"
        else
          puts "FlipperFeature: ipynb-diff already exists"
        end

        ff = FlipperFeature.find_by(name: feature_name)
        ff&.enable(mona)

        unless preview = Feature.find_by(flipper_feature: ff)
          Feature.create!(
            public_name: "Rich Notebook Diffs",
            slug: feature_name,
            flipper_feature: ff,
            feedback_link: "https://github.com/community/community/discussions/37376",
            enrolled_by_default: true
          )
        end
      end

      sig { params(repo: Repository, mona: User).void }
      def create_ipynb_prs(repo, mona)
        base_ref = repo.refs.find("refs/heads/master")

        puts "Creating ipynb deletion PR"
        head_ref = repo.refs.find("refs/heads/ipynb_delete_notebook")
        pr = ::PullRequest.create_for!(
          repo,
          user: mona,
          title: "Deleting a notebook",
          body: "Deleting a notebook",
          head: head_ref.name,
          base: base_ref.name
        )

        puts "Creating ipynb cell deletion PR"
        head_ref = repo.refs.find("refs/heads/ipynb_delete_cell")
        pr = ::PullRequest.create_for!(
          repo,
          user: mona,
          title: "Deleting a notebook cell",
          body: "Deleting a notebook cell",
          head: head_ref.name,
          base: base_ref.name
        )

        puts "Creating ipynb cell edit PR"
        head_ref = repo.refs.find("refs/heads/ipynb_edit")
        pr = ::PullRequest.create_for!(
          repo,
          user: mona,
          title: "Editing some notebook cells",
          body: "Editing some notebook cells",
          head: head_ref.name,
          base: base_ref.name
        )

        puts "Creating invalid notebook PRs"
        head_ref = repo.refs.find("refs/heads/ipynb_valid_to_invalid")
        pr = ::PullRequest.create_for!(
          repo,
          user: mona,
          title: "Don't mind me, just breaking a notebook on purpose",
          body: "Don't mind me, just breaking a notebook on purpose",
          head: head_ref.name,
          base: base_ref.name
        )

        head_ref = repo.refs.find("refs/heads/ipynb_invalid_to_valid")
        pr = ::PullRequest.create_for!(
          repo,
          user: mona,
          title: "Good news: I fixed the notebook",
          body: "Good news: I fixed the notebook",
          head: head_ref.name,
          base: base_ref.name
        )

        head_ref = repo.refs.find("refs/heads/add-new-notebook")
        pr = ::PullRequest.create_for!(
          repo,
          user: mona,
          title: "Add new notebook",
          body: "Add new notebook",
          head: head_ref.name,
          base: base_ref.name
        )

        head_ref = repo.refs.find("refs/heads/change-output")
        pr = ::PullRequest.create_for!(
          repo,
          user: mona,
          title: "Changing cell output",
          body: "Changing cell output",
          head: head_ref.name,
          base: base_ref.name
        )

        head_ref = repo.refs.find("refs/heads/delete-output")
        pr = ::PullRequest.create_for!(
          repo,
          user: mona,
          title: "Deleting cell output",
          body: "Deleting cell output",
          head: head_ref.name,
          base: base_ref.name
        )

        head_ref = repo.refs.find("refs/heads/tonsofnotebooks")
        pr = ::PullRequest.create_for!(
          repo,
          user: mona,
          title: "Adding tons of notebooks",
          body: "Adding tons of notebooks",
          head: head_ref.name,
          base: base_ref.name
        )
      end
    end

    sig { params(repo: Repository, mona: User).void }
    def create_renderable_file_prs(repo, mona)
      base_ref = repo.refs.find("refs/heads/master")
      head_ref = repo.refs.find("refs/heads/jpg-diff-branch")

      puts "Creating image diff PRs"
      ::PullRequest.create_for!(
        repo,
        user: mona,
        title: "Trying out a new jpg color",
        body: "Testing an alternate color for img0.jpg",
        head: head_ref.name,
        base: base_ref.name
      )

      large_head_ref = repo.refs.find("refs/heads/jpg-diff-branch-unlimited")
      puts "Creating large image diff PR"
      ::PullRequest.create_for!(
        repo,
        user: mona,
        title: "Adds 100 jpgs",
        body: "Here are 100 jpgs",
        head: large_head_ref.name,
        base: base_ref.name
      )
      large_comparison_ref = repo.refs.find("refs/heads/jpg-diff-branch-changed")
      puts "Creating large image comparison diff PR"
      ::PullRequest.create_for!(
        repo,
        user: mona,
        title: "Adds 100 jpg comparisons",
        body: "Here are 100 jpg comparison diffs",
        head: large_comparison_ref.name,
        base: large_head_ref.name
      )
      head_ref = repo.refs.find("refs/heads/svg-diff-branch")
      ::PullRequest.create_for!(
        repo,
        user: mona,
        title: "Updates octocat.svg",
        body: "Example SVG file diff",
        head: head_ref.name,
        base: base_ref.name
      )
    end
  end
end
