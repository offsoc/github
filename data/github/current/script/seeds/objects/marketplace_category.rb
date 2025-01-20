# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class MarketplaceCategory
      SEED = {
        "Code quality" => {
          description: "Automate your code review by testing the style, quality, security, and test‑coverage of your code.",
          navigation_visible: true,
          featured: true,
          featured_position: 2,
        },
        "Deployment" => {
          description: "Streamline your code deployment so you can focus on your product.",
          navigation_visible: true,
        },
        "Container CI" => {
          description: "Automatically build and package your code as you push it to GitHub.",
          navigation_visible: true,
        },
        "Continuous integration" => {
          description: "Automatically build and test your code as you push it to GitHub, preventing bugs from being deployed to production.",
          navigation_visible: true,
          featured: true,
          featured_position: 3,
        },
        "Dependency management" => {
          description: "Secure and manage your third-party dependencies.",
          navigation_visible: true,
        },
        "Free trials" => {
          description: "Apps that support free, time-limited, access to their service.",
          acts_as_filter: true,
        },
        "Localization" => {
          description: "Extend your software's reach. Localize and translate continuously from GitHub.",
          navigation_visible: true,
        },
        "Monitoring" => {
          description: "Monitor the impact of your code changes. Measure performance, track errors, and analyze your application.",
          navigation_visible: true,
          featured: true,
          featured_position: 4,
        },
        "Mobile CI" => {
          description: "Automatically build and package your code as you push it to GitHub.",
          navigation_visible: true,
        },
        "Project management" => {
          description: "Organize, manage, and track your project with tools that build on top of issues and pull requests.",
          navigation_visible: true,
          featured: true,
          featured_position: 5,
        },
        "Time tracking" => {
          description: "Track your progress, and predict how long a task will take based on your coding activity.",
          navigation_visible: true,
        },
        "Code review" => {
          description: "Ensure your code meets quality standards and ship with confidence.",
          navigation_visible: true,
        },
        "Recently added" => {
          description: "The latest apps that help you and your team build software better, together.",
          featured: true,
          featured_position: 1,
        },
        "Community" => {
          description: "Tools for the community.",
          navigation_visible: false,
        },
      }

      def self.seed_all
        SEED.each do |name, info|
          puts "> Creating #{name} category"
          create(name: name, info: info)
        end
      end

      def self.create(name:, info:)
        category = Marketplace::Category.find_by(name: name) || Marketplace::Category.new(name: name)
        category.assign_attributes(info)
        category.save!

        # NOTE: featured_position has a uniqueness validation. If the local data
        # already has featured categories then it's likely it will run into errors
        # when this script tries to set different positions. Instead let's call
        # update on a separate step and simply ignore any related errors.
        featured_info = info.extract!(:featured, :featured_position)
        category.update(featured_info)
        category
      end

      def self.create_random
        used_names = Marketplace::Category.all.pluck(:name)
        unused_seeds = SEED.except(*used_names).reject { |_, info| info[:acts_as_filter] }

        if unused_seeds.empty?
          raise ArgumentError, "All SEED data was used, cannot make another random category"
        end

        name, info = unused_seeds.to_a.sample
        puts "> Creating #{name} category"
        create(name: name, info: info)
      end

      def self.random(except_category: nil)
        all_categories = Marketplace::Category.scoped.where(acts_as_filter: false)
        all_categories = all_categories.where.not(id: except_category.id) if except_category
        unused_categories = all_categories.where(primary_listing_count: 0, secondary_listing_count: 0)
        unused_categories.sample || all_categories.sample
      end
    end
  end
end
