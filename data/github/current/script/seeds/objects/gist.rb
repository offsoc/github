# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Gist
      def self.create(user:, contents: {}, public: true)
        require File.join(Rails.root, "packages/gists/app/models/gist/creator")

        creator = ::Gist::Creator.new(user: user, contents: contents, public: public)
        if creator.create
          creator.gist
        else
          message = "\nCannot create gist with options #{options.inspect}.\nErrors: "
          message << creator.gist.errors.full_messages.to_sentence
          fail message
        end
      end

      def self.restore_premade_repo(user:, example_git:, public: true)
        require File.join(Rails.root, "packages/gists/app/models/gist/creator")
        # We cannot easily construct a Gist without contents, but here they
        # will be immediately replaced by the contents of an example repository.
        placeholder_contents = [{ name: "placeholder", value: "." }]

        gist = self.create(user: user, contents: placeholder_contents, public: true)

        examples_folder = File.join(Rails.root, "test/fixtures/git/examples/")
        git_folder = File.join(examples_folder, "#{example_git}.git")

        gist.dgit_all_routes.map(&:path).each do |dest|
          FileUtils.rm_rf(dest)
          FileUtils.mkdir_p File.dirname(dest)
          FileUtils.cp_r(git_folder, dest)
        end

        reader = GitHub::DGit::Routing.hosts_for_gist(gist.id).first
        res = GitHub::DGit::Maintenance.recompute_gist_checksums(gist, reader)

        gist
      end
    end
  end
end
