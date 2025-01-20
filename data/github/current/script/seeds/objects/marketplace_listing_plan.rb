# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class MarketplaceListingPlan
      def self.create(listing:, name: "#{Faker::Creature::Cat.breed} Plan #{listing.listing_plans.count}", monthly_price_in_cents: 0, yearly_price_in_cents: 0, free_trial: false, per_unit: false)
        if (plan = Marketplace::ListingPlan.find_by(name: name, listing: listing))
          return plan
        end

        plan = Marketplace::ListingPlan.new(
          state: :published,
          name: name,
          monthly_price_in_cents: monthly_price_in_cents,
          yearly_price_in_cents: yearly_price_in_cents,
          listing: listing,
          has_free_trial: free_trial,
          per_unit: per_unit,
          description: Faker::Company.catch_phrase,
        )

        if per_unit
          plan.unit_name = "seat"
          puts "> Create paid, per-unit plan for #{listing.name}: #{plan.name}"
        else
          puts "> Create free plan for #{listing.name}: #{plan.name}"
        end

        plan.save!

        num_bullets = rand(3) + 1
        num_bullets.times do
          Marketplace::ListingPlanBullet.create(
            listing_plan: plan,
            value: "The ##{plan.bullets.count + 1} reason to choose this plan.",
          )
        end

        plan
      end
    end
  end
end
