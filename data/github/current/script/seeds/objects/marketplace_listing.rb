# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class MarketplaceListing

      def self.languages
        return @languages if @languages

        @php = LanguageName.find_by(name: "PHP")
        @php ||= FactoryBot.create(:php_language_name)

        @javascript = LanguageName.find_by(name: "JavaScript")
        @javascript ||= FactoryBot.create(:javascript_language_name)

        @ruby = LanguageName.find_by(name: "Ruby")
        @ruby ||= FactoryBot.create(:ruby_language_name)

        @languages = [@php, @javascript, @ruby]

        @languages
      end

      def self.create(listable:, name: Faker::Company.unique.name)
        if (listing = Marketplace::Listing.find_by(name: name, listable: listable))
          return listing
        end

        random_primary_category = Seeds::Objects::MarketplaceCategory.random || Seeds::Objects::MarketplaceCategory.create_random
        marketplace_listing = Marketplace::Listing.new(
          name: name,
          short_description: Faker::Company.catch_phrase,
          full_description: Faker::Markdown.sandwich(sentences: 3, repeat: 2)[0...Marketplace::Listing::FULL_DESCRIPTION_MAX_LENGTH - 10],
          extended_description: Faker::Markdown.sandwich(sentences: 10, repeat: 3)[0..Marketplace::Listing::EXTENDED_DESCRIPTION_MAX_LENGTH - 10],
          state: :verified,
          categories: [random_primary_category],
          primary_category_id: random_primary_category.id,
          privacy_policy_url: "http://example.com/privacy",
          support_url: "http://example.com/support",
          installation_url: "http://example.com/install",
          bgcolor: %w(ffffff 000000 f6f8fa 0969da 1f883d cf222e 8250df bf3989 ffebe9).sample,
          by_github: [true, false].sample
        )
        marketplace_listing.listable = listable

        # Sometimes set a secondary category
        if [true, false].sample
          random_secondary_category = Seeds::Objects::MarketplaceCategory.random(except_category: random_primary_category) || Seeds::Objects::MarketplaceCategory.create_random
          marketplace_listing.categories = [random_primary_category, random_secondary_category]
          marketplace_listing.secondary_category_id = random_secondary_category.id
        end

        yield marketplace_listing if block_given?

        marketplace_listing.save!
        marketplace_listing.send(:update_category_counters, event: :approve)
        Sequence.set(marketplace_listing, 0)

        # Sometimes set a language
        if [true, false].sample

          selected_languages = self.languages.sample(rand(1..self.languages.length))

          selected_languages.each do |language|
            mp_listing_supported_language = Marketplace::ListingSupportedLanguage.new(marketplace_listing_id: marketplace_listing.id, language_name_id: language.id)
            mp_listing_supported_language.save!
          end
        end

        marketplace_listing
      end
    end
  end
end
