# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class BillingTransactions < Seeds::Runner
      def self.help
        <<~HELP
        Creates billing transactions and line items for a handful of users to simulate the kind of billing data
        that exists in production.
        HELP
      end

      def self.run(options = {})
        require_relative "../factory_bot_loader"
        require "timecop"
        new.run(options)
      end

      def run(options)
        create_users_with_payment_methods
        create_plan_subscriptions
        create_trade_screening_records
        create_plan_subscriptions
        create_sponsorships
        create_marketplace_subscriptions
        create_non_subscribable_line_items
        create_refund_transactions
        create_voided_transactions
        create_transactions_with_different_statuses
        puts "\nDone!"
      end

      private

      def create_users_with_payment_methods
        puts "\nCreating users with payment methods..."
        puts "- " + users_with_payment_methods.map(&:login).join(", ")
      end

      def create_trade_screening_records
        puts "\nCreating trade screening profiles..."
        users_with_payment_methods.each do |user|
          unless user.trade_screening_record
            puts "- Creating for #{user}"
            FactoryBot.create(:account_screening_profile, owner: user)
          end
        end
      end

      def create_plan_subscriptions
        puts "\nCreating plan subscriptions..."
        users_with_payment_methods.each do |user|
          unless user.reload_plan_subscription
            puts "- Creating for #{user}"
            FactoryBot.create(:billing_plan_subscription, :zuora, user: user)
          end
        end
      end

      def create_sponsorships
        return unless GitHub.sponsors_enabled?
        puts "\nCreating sponsorships..."
        a_few_times_in_the_past_for_each_user(users_with_payment_methods) do |user|
          create_sponsorship_from(user)
        end
      end

      def create_marketplace_subscriptions
        return unless GitHub.marketplace_enabled?
        puts "\nCreating marketplace subscriptions..."
        a_few_times_in_the_past_for_each_user(users_with_payment_methods) do |user|
          create_marketplace_subscription_from(user)
        end
      end

      def create_non_subscribable_line_items
        puts "\nCreating other line items..."
        a_few_times_in_the_past_for_each_user(users_with_payment_methods) do |user|
          create_line_items_for(user)
        end
      end

      def create_refund_transactions
        puts "\nCreating refunds..."
        a_few_times_in_the_past_for_each_user(users_with_payment_methods) do |user|
          create_refund_transaction_for(user)
        end
      end

      def create_voided_transactions
        puts "\nCreating voided transactions..."
        a_few_times_in_the_past_for_each_user(users_with_payment_methods) do |user|
          create_voided_transaction_for(user)
        end
      end

      def create_transactions_with_different_statuses
        puts "\nCreating transactions with different last statuses..."
        Billing::BillingTransactionStatuses::ALL.keys.each do |status|
          users_with_payment_methods.each do |user|
            Timecop.freeze(random_time) { create_transaction_with_status_for(user, status) }
          end
        end
      end

      def a_few_times_in_the_past_for_each_user(users)
        users.each do |user|
          (rand(5) + 1).times do
            Timecop.freeze(random_time) { yield(user) }
          end
        end
      end

      def create_sponsorship_from(sponsor)
        timestamp = Time.now
        tier = create_sponsors_tier
        sponsorable = tier.sponsorable
        sponsorship = FactoryBot.create(:sponsorship, :with_billing_transaction_and_line_item, sponsor: sponsor,
          tier: tier, sponsorable: sponsorable)
        puts "- At #{timestamp}, #{sponsor} sponsored #{sponsorable} for #{tier}"
        FactoryBot.create(:sponsors_activity, :new_sponsorship, sponsorable: sponsorable,
          timestamp: timestamp, sponsor: sponsor)
      end

      def create_marketplace_subscription_from(user)
        traits = []
        traits << if [true, false].sample
          [true, false].sample ? :free : :free_trial
        else
          :paid
        end
        sub_item = FactoryBot.create(:billing_subscription_item, *traits, plan_subscription: user.plan_subscription)
        listing_plan = sub_item.subscribable
        puts "- At #{Time.now}, #{user} subscribed to '#{listing_plan.name}' for #{listing_plan.base_price.format}"

        transaction = FactoryBot.create(:billing_transaction, :zuora, user: user,
          amount_in_cents: listing_plan.monthly_price_in_cents)
        FactoryBot.create(:billing_transaction_line_item, billing_transaction: transaction,
          subscribable: listing_plan, amount_in_cents: listing_plan.monthly_price_in_cents, quantity: 1,
          description: listing_plan.description, plan_subscription: user.plan_subscription)
      end

      def create_line_items_for(user)
        create_actions_private_usage_line_item_for(user)
        create_actions_core_line_items_for(user)
      end

      def create_refund_transaction_for(user)
        charge_dollars = rand(25) + 1
        refund_dollars = rand(charge_dollars - 1) + 1
        charge = FactoryBot.create(:billing_transaction, amount_in_cents: charge_dollars * 100, user: user)
        refund = FactoryBot.create(:billing_transaction, :refund, amount_in_cents: refund_dollars * -100,
          sale_transaction_id: charge.transaction_id, user: user)
        puts "- At #{Time.now}, $#{refund_dollars} was refunded from a charge of $#{charge_dollars} for #{user}"
      end

      def create_voided_transaction_for(user)
        FactoryBot.create(:billing_transaction, :voided, user: user)
        coupon = FactoryBot.create(:coupon)
        user.redeem_coupon(coupon)
        puts "- At #{Time.now}, a coupon was redeemed for #{user}"
      end

      def create_transaction_with_status_for(user, status)
        FactoryBot.create(:billing_transaction, user: user, last_status: status)
        puts "- At #{Time.now}, #{user} had a transaction with status #{status}"
      end

      def create_actions_private_usage_line_item_for(user)
        billing_transaction = FactoryBot.create(:billing_transaction, :zuora, plan_name: "pro",
          amount_in_cents: 7_00, user: user)
        line_item = FactoryBot.create(:billing_transaction_line_item, :actions_private_usage,
          billing_transaction: billing_transaction, quantity: 10, amount_in_cents: 0)
        puts "- #{line_item.description} for #{user}"
      end

      def create_actions_core_line_items_for(user)
        transaction = FactoryBot.create(:billing_transaction, plan_name: "pro",
          amount_in_cents: 9_75, user: user)
        line_item1 = FactoryBot.create(:billing_transaction_line_item, :actions_8_core, quantity: 100,
          amount_in_cents: 30, billing_transaction: transaction)
        line_item2 = FactoryBot.create(:billing_transaction_line_item, :actions_16_core, quantity: 10,
          amount_in_cents: 60, billing_transaction: transaction)

        puts "- #{line_item1.description} and #{line_item2.description} for #{user}"
      end

      def create_sponsors_tier
        dollars = rand(500) + 1
        traits = [:approved_sponsors_listing]
        traits << :one_time if [true, false].sample
        FactoryBot.create(:sponsors_tier, *traits, monthly_price_in_cents: dollars * 100)
      end

      def random_time
        time = rand(24).months.ago + rand(4).weeks + rand(7).days + rand(24).hours + rand(60).minutes
        [time, Time.now].min
      end

      def users_with_payment_methods
        return @users_with_payment_methods if @users_with_payment_methods
        users = [credit_card_user, paypal_user, india_based_cc_user]
        GitHub::PrefillAssociations.prefill_associations(users, [:plan_subscription, :trade_screening_record])
        @users_with_payment_methods = users
      end

      def credit_card_user
        return @credit_card_user if @credit_card_user
        login = "userWithACreditCard"
        @credit_card_user = User.find_by(login: login) || FactoryBot.create(:credit_card_user, login: login)
      end

      def paypal_user
        return @paypal_user if @paypal_user
        login = "IUsePayPalForMyPurchases"
        @paypal_user = User.find_by(login: login) || FactoryBot.create(:paypal_user, login: login)
      end

      def india_based_cc_user
        return @india_based_cc_user if @india_based_cc_user
        login = "UserInIndiaUsingACreditCard"
        @india_based_cc_user = User.find_by(login: login) || FactoryBot.create(:india_based_credit_card_user,
          login: login)
      end
    end
  end
end
