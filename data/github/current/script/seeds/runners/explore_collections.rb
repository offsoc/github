# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class ExploreCollections < Seeds::Runner
      def self.help
        <<~HELP
        Seed collections for Explore for local development
        HELP
      end

      def self.run(options = {})
        require "#{Rails.root}/test/test_helpers/sham"
        require "factory_bot_rails"

        new.run(options)
      end

      def run(options)
        create_explore_collections

        puts "\nFinished seeding Explore Collections"
      end

      private

      def create_explore_collections
        create_explore_collection("Learn to Code", featured: true, repository_count: 3,
          image_url: "http://github.localhost/images/email/sponsors/mona.png")
        create_explore_collection("Pixel Art Tools", repository_count: 4, featured: true,
          image_url: "http://github.localhost/images/email/welcome-email/welcometocat.png")
        create_explore_collection("Neat Open Source Maintainers", user_count: 5,
          image_url: "http://github.localhost/images/email/sponsors/sponsors-icon.png")
        create_explore_collection("Fun Sites", url_count: 6, featured: true,
          image_url: "http://github.localhost/images/octosurvey/janecat.png")
        create_explore_collection("Engaging Videos", video_count: 5,
          image_url: "http://github.localhost/images/email/sponsors/many_hearts_mona.png")
      end

      def create_explore_collection(display_name, featured: false, repository_count: 0, user_count: 0, url_count: 0, video_count: 0, image_url: nil)
        collection = ExploreCollection.find_by(display_name: display_name)

        if collection
          puts "Found collection '#{display_name}'"
        else
          puts "Creating collection '#{display_name}'"
          collection = FactoryBot.create(:explore_collection, display_name: display_name, featured: featured)
        end

        if image_url.present? && collection.image_url != image_url
          puts "- Updating image for collection"
          collection.update_attribute(:image_url, image_url)
        end

        unless collection.featured? == featured
          puts "- Marking collection as #{featured ? "" : "not "}featured"
          collection.update_attribute(:featured, featured)
        end

        add_and_remove_repos_from_collection(collection, repository_count)
        add_and_remove_users_from_collection(collection, user_count)
        add_and_remove_urls_from_collection(collection, url_count)
        add_and_remove_videos_from_collection(collection, video_count)

        collection
      end

      def add_and_remove_repos_from_collection(collection, repository_count)
        create_repo = -> do
          repo_owner_login = "user-#{SecureRandom.hex(12)}"
          repo_name = "repo-#{SecureRandom.hex(16)}"
          repo = Seeds::Objects::Repository.create_with_nwo(
            nwo: "#{repo_owner_login}/#{repo_name}",
            setup_master: false,
            is_public: true,
          )
          FactoryBot.create(:repository_collection_item, collection: collection, content: repo)
        end

        add_and_remove_items_from_collection(collection, item_count: repository_count, content_type: "Repository",
          item_creator: create_repo)
      end

      def add_and_remove_users_from_collection(collection, user_count)
        add_and_remove_items_from_collection(collection, item_count: user_count, content_type: "User",
          factory: :user_collection_item)
      end

      def add_and_remove_urls_from_collection(collection, url_count)
        add_and_remove_items_from_collection(collection, item_count: url_count, content_type: "CollectionUrl",
          factory: :url_collection_item)
      end

      def add_and_remove_videos_from_collection(collection, video_count)
        add_and_remove_items_from_collection(collection, item_count: video_count, content_type: "CollectionVideo",
          factory: :video_collection_item)
      end

      def add_and_remove_items_from_collection(collection, item_count:, content_type:, item_creator: nil, factory: nil)
        items = collection.items.where(content_type: content_type)
        total_urls = items.count

        if total_urls < item_count
          items_to_make = item_count - total_urls
          items_to_make.times do
            puts "- Adding #{content_type} to collection"
            if factory
              FactoryBot.create(factory, collection: collection)
            else
              item_creator.call
            end
          end
        elsif total_urls > item_count
          items_to_destroy = total_urls - item_count
          puts "- Removing #{items_to_destroy} #{content_type}(s) from collection"
          items.limit(items_to_destroy).destroy_all
        end
      end
    end
  end
end
