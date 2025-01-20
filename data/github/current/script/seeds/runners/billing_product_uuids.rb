# typed: strict
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class BillingProductUUIDs < Seeds::Runner
      extend T::Sig
      PRODUCT_TYPES = T.let({
        github_plan: "github_plan",
        actions: "actions",
        package_registry: "package_registry",
        shared_storage: "shared_storage",
        codespaces: "codespaces",
        copilot: "copilot",
        advanced_security: "advanced_security",
        git_lfs: "git_lfs",
        ghec_cloud_usage: "ghec_cloud_usage"
      }, T::Hash[Symbol, String])

      sig { returns(String) }
      def self.help
        <<~HELP
        Creates Billing::ProductUUIDs for plans and features.

        Available product types:
          #{PRODUCT_TYPES.values.join(", ")}
        HELP
      end

      sig { params(options: T::Hash[Symbol, T.untyped]).void }
      def self.run(options = {})
        case options[:product_type]
        when PRODUCT_TYPES[:github_plan]
          create_product_uuids_for_paid_plans
        when PRODUCT_TYPES[:actions]
          create_product_uuids_for_actions
        when PRODUCT_TYPES[:package_registry]
          create_product_uuids_for_package_registry
        when PRODUCT_TYPES[:shared_storage]
          create_product_uuids_for_shared_storage
        when PRODUCT_TYPES[:codespaces]
          create_product_uuids_for_codespaces
        when PRODUCT_TYPES[:copilot]
          create_product_uuids_for_copilot
        when PRODUCT_TYPES[:advanced_security]
          create_product_uuids_for_advanced_security
        when PRODUCT_TYPES[:git_lfs]
          create_product_uuids_for_lfs
        when PRODUCT_TYPES[:ghec_cloud_usage]
          create_product_uuids_for_ghec_cloud_usage
        else
          raise Runner::RunnerError, "Unsupported product type, check help for the available product types"
        end
      rescue ActiveRecord::RecordInvalid => e
        raise unless e.message =~ /has already been taken/
      end

      sig { void }
      def self.create_product_uuids_for_copilot
        Billing::ProductUUID.create!(
          product_type: "github.copilot",
          product_key: "v0",
          billing_cycle: "year",
          zuora_product_id: "8ad095dd828b63d301828d69d0cc083b",
          zuora_product_rate_plan_id: "8ad095dd828b63d301828d69d7a10858",
          zuora_product_rate_plan_charge_ids: { flat: "8ad09915828b63c701828d69dd4b4eaa" },
          name: "GitHub Copilot",
          charges: [
            {
              "name" => "GitHub Copilot - year",
              "type" => "flat",
              "price" => "100.0",
              "billing_duration" => "year",
              "zuora_product_rate_plan_charge_id" => "8ad09915828b63c701828d69dd4b4eaa"
            }
          ]
        )

        Billing::ProductUUID.create!(
          product_type: "github.copilot",
          product_key: "v0",
          billing_cycle: "month",
          zuora_product_id: "8ad095dd828b63d301828d69d0cc083b",
          zuora_product_rate_plan_id: "8ad09bce828b63d901828d69e4a02b77",
          zuora_product_rate_plan_charge_ids: { flat: "8ad095b8828b63cc01828d69ea5757d0" },
          name: "GitHub Copilot",
          charges: [{
            "name" => "GitHub Copilot - month",
            "type" => "flat",
            "price" => "10.0",
            "billing_duration" => "month",
            "zuora_product_rate_plan_charge_id" => "8ad095b8828b63cc01828d69ea5757d0"
          }]
        )

        Billing::ProductUUID.create!(
          product_type: "github.copilot",
          product_key: "business.v0",
          billing_cycle: "month",
          zuora_product_id: "8ad0887e82b04d1e0182b15d93c93388",
          zuora_product_rate_plan_id: "8ad0877b82b04d0d0182b15db69414b3",
          zuora_product_rate_plan_charge_ids: { user_month: "8ad0877b82b04d0d0182b15db9ef14ba" },
          name: "GitHub Copilot Business",
          metered: true,
          charges: [{
            "name" => "GitHub Copilot",
            "type" => "per_unit",
            "price" => 19,
            "billing_duration" => "month",
            "zuora_product_rate_plan_charge_id" => "8ad0877b82b04d0d0182b15db9ef14ba"
          }]
        )

        Billing::ProductUUID.create!(
          product_type: "github.copilot",
          product_key: "GitHub Copilot Standalone",
          billing_cycle: "month",
          zuora_product_id: "8ad08ae28ca5e964018cc94b209b78c3",
          zuora_product_rate_plan_id: "8ad08ae28ca5e964018cc94b20af78c6",
          zuora_product_rate_plan_charge_ids: { user_month: "8ad08ae28ca5e964018cc94b20cb78cb" },
          name: "GitHub Copilot Standalone",
          metered: true,
          charges: [{
            "name" => "GitHub Copilot Standalone",
            "type" => "per_unit",
            "price" => 19,
            "billing_duration" => "month",
            "zuora_product_rate_plan_charge_id" => "8ad08ae28ca5e964018cc94b20cb78cb"
          }]
        )

        Billing::ProductUUID.create!(
          product_type: "github.copilot",
          product_key: "GitHub Copilot Enterprise",
          billing_cycle: "month",
          zuora_product_id: "8ad08ae28ca5e964018cc9486f973425",
          zuora_product_rate_plan_id: "8ad08ae28ca5e964018cc9487e493525",
          zuora_product_rate_plan_charge_ids: { user_month: "8ad08ae28ca5e964018cc9487e69352a" },
          name: "GitHub Copilot Enterprise",
          metered: true,
          charges: [{
            "name" => "GitHub Copilot Enterprise",
            "type" => "per_unit",
            "price" => 39,
            "billing_duration" => "month",
            "zuora_product_rate_plan_charge_id" => "8ad08ae28ca5e964018cc9487e69352a"
          }]
        )
      end

      sig { void }
      def self.create_product_uuids_for_paid_plans
        product_uuids_path = Rails.root.join("script/seeds/data/billing/github_plans_product_uuids.yml")
        product_uuids_raw = YAML.safe_load(File.open(product_uuids_path), permitted_classes: [Symbol])

        if (GitHub::Plan.all.count(&:paid?) * 2) != product_uuids_raw.count
          raise Runner::RunnerError, "The number of ProductUUIDs in script/seeds/data/billing/github_plans_product_uuids.yml doesn't match the number of paid plans in config/plans.yml"
        else
          product_uuids_raw.each do |product_uuid|
            Billing::ProductUUID.create!(product_uuid)
          end
        end
      end


      sig { void }
      def self.create_product_uuids_for_ghec_cloud_usage
        Billing::ProductUUID.create!(
          product_type: "github.ghec",
          product_key: "GitHub Enterprise Cloud Usage",
          billing_cycle: "month",
          metered: true,
          name: "GitHub Enterprise Cloud Usage",
          zuora_product_id: "8ad081dd8f0f3616018f168a9d2c16ff",
          zuora_product_rate_plan_id: "8ad081dd8f0f3616018f168b79bf1725",
          zuora_product_rate_plan_charge_ids: {
            usage: "8ad097b48f0f4d15018f168d4b976764",
          },
        )
      end

      sig { void }
      def self.create_product_uuids_for_actions
        Billing::ProductUUID.create!(
          product_type: "github.actions",
          product_key: "Public Repos Usage",
          billing_cycle: "month",
          name: "GitHub Actions - Public Repos Usage",
          zuora_product_id: "2c92c0f86cccaa55016ccf2b442b2ca6",
          zuora_product_rate_plan_id: "2c92c0f96ccccd81016ccf2b44e90326",
          zuora_product_rate_plan_charge_ids: { usage: "2c92c0f96ccccd84016ccf2b46746ed5" },
        )

        Billing::ProductUUID.create!(
          product_type: "github.actions",
          product_key: "Private Repos Usage",
          billing_cycle: "month",
          metered: true,
          name: "GitHub Actions - Private Repos Usage",
          zuora_product_id: "2c92c0f86cccaa55016ccf2b442b2ca6",
          zuora_product_rate_plan_id: "2c92c0f86cccaa55016ccf2b473c6e5c",
          zuora_product_rate_plan_charge_ids: { usage: "2c92c0f96ccccd84016ccf2b47fd6eda" },
        )

        Billing::ProductUUID.create!(
          product_type: "github.actions",
          product_key: "GitHub Actions - Runners",
          billing_cycle: "month",
          metered: true,
          name: "GitHub Actions - Runners",
          zuora_product_id: "2c92c0f86cccaa55016ccf2b442b2ca6",
          zuora_product_rate_plan_id: "8ad095dd8242de0c01824536fcd1040d",
          zuora_product_rate_plan_charge_ids: {
            "4_core": "8ad099158242de020182453ef3437045",
            "8_core": "8ad099158242de020182453ef1dd6fe6",
            "16_core": "8ad099158242de020182453ef23b7026",
            "32_core": "8ad099158242de020182453ef296702f",
            "64_core": "8ad099158242de020182453ef2ec703a",
          },
        )

        Billing::ProductUUID.create!(
          product_type: "github.actions",
          product_key: "GitHub Actions - ARM Usage",
          billing_cycle: "month",
          metered: true,
          name: "GitHub Actions - ARM Usage",
          zuora_product_id: "2c92c0f86cccaa55016ccf2b442b2ca6",
          zuora_product_rate_plan_id: "8ad081dd8fbe8ed6018fc15ab5083d84",
          zuora_product_rate_plan_charge_ids: {
            "linux_2_core_arm": "8ad081dd8fbe8ed6018fc15ab5913d8c",
            "linux_4_core_arm": "8ad081dd8fbe8ed6018fc15ab54d3d86",
            "linux_8_core_arm": "8ad081dd8fbe8ed6018fc15ab6543da4",
            "linux_16_core_arm": "8ad081dd8fbe8ed6018fc15ab6833daa",
            "linux_32_core_arm": "8ad081dd8fbe8ed6018fc15ab5ef3d98",
            "linux_64_core_arm": "8ad081dd8fbe8ed6018fc15ab6203d9e",
            "windows_2_core_arm": "8ad081dd8fbe8ed6018fc15ab5bd3d92",
            "windows_4_core_arm": "8ad081dd8fbe8ed6018fc15ab7853dc8",
            "windows_8_core_arm": "8ad081dd8fbe8ed6018fc15ab74a3dc2",
            "windows_16_core_arm": "8ad081dd8fbe8ed6018fc15ab7163dbc",
            "windows_32_core_arm": "8ad081dd8fbe8ed6018fc15ab6e63db6",
            "windows_64_core_arm": "8ad081dd8fbe8ed6018fc15ab6b53db0",
          },
        )

        Billing::ProductUUID.create!(
          product_type: "github.actions",
          product_key: "GitHub Actions - GPU Usage",
          billing_cycle: "month",
          metered: true,
          name: "GitHub Actions - GPU Usage",
          zuora_product_id: "2c92c0f86cccaa55016ccf2b442b2ca6",
          zuora_product_rate_plan_id: "8ad08f068b415785018b4500005e5594",
          zuora_product_rate_plan_charge_ids: {
            "linux_4_core_gpu": "8ad08f068b415785018b4500012355f8",
            "windows_4_core_gpu": "8ad08f068b415785018b450000bf55c5",
          },
        )

        Billing::ProductUUID.create!(
          product_type: "github.actions",
          product_key: "GitHub Actions - Advanced Usage",
          billing_cycle: "month",
          metered: true,
          name: "GitHub Actions - Advanced Usage",
          zuora_product_id: "2c92c0f86cccaa55016ccf2b442b2ca6",
          zuora_product_rate_plan_id: "8ad08ae28da7ab63018da93f2b0c611a",
          zuora_product_rate_plan_charge_ids: {
            "linux_2_core_advanced": "8ad08ae28da7ab63018da93f2b4f611c",
            "windows_2_core_advanced": "8ad08ae28da7ab63018da93f2bb26122",
          },
        )

        Billing::ProductUUID.create!(
          product_type: "github.actions",
          product_key: "GitHub Actions - macOS 12-Core Usage",
          billing_cycle: "month",
          metered: true,
          name: "GitHub Actions - macOS 12-Core Usage",
          zuora_product_id: "2c92c0f86cccaa55016ccf2b442b2ca6",
          zuora_product_rate_plan_id: "8ad09384858682c301859d87382f767a",
          zuora_product_rate_plan_charge_ids: {
            "github_actions_mac_os_12_core_usage": "8ad09384858682c301859d873895767c",
          },
        )

        # billing-platform product
        Billing::ProductUUID.create!(
          product_type: "github.actions",
          product_key: "GitHub Actions Usage",
          billing_cycle: "month",
          zuora_product_id: "8ad08e1a8876289c01887885c7dd14de",
          zuora_product_rate_plan_id: "8ad085e2887628ae01887887ec792391",
          zuora_product_rate_plan_charge_ids: {
            "github_actions_usage": "8ad081c68876289f0188788b16ed73e1"
          },
          name: "GitHub Actions Usage",
          metered: true,
          charges: [{
            "name" => "GitHub Actions Usage",
            "type" => "per_unit",
            "price" => 1.0,
            "billing_duration" => "month",
            "zuora_product_rate_plan_charge_id" => "8ad081c68876289f0188788b16ed73e1"
          }]
        )
      end

      sig { void }
      def self.create_product_uuids_for_package_registry
        Billing::ProductUUID.create!(
          product_type: Billing::PackageRegistry::ZuoraProduct.product_type,
          product_key: Billing::PackageRegistry::ZuoraProduct.product_key,
          billing_cycle: "month",
          metered: true,
          zuora_product_id: "2c92c0f96cfb2609016cfd7705ea5cb5",
          zuora_product_rate_plan_id: "2c92c0f86cfb1829016cfd7707373028",
          zuora_product_rate_plan_charge_ids: { bandwidth: "2c92c0f86cfb182c016cfd7708c90755" },
        )
      end

      sig { void }
      def self.create_product_uuids_for_shared_storage
        Billing::ProductUUID.create!(
          product_type: ::Billing::SharedStorage::ZuoraProduct.product_type,
          product_key: ::Billing::SharedStorage::ZuoraProduct.product_key,
          billing_cycle: "month",
          metered: true,
          zuora_product_id: "2c92c0f86dcf20a8016dd618f863738b",
          zuora_product_rate_plan_id: "2c92c0f96dcf2f3d016dd619033654cc",
          zuora_product_rate_plan_charge_ids: { usage: "2c92c0f96dcf2f3d016dd619105b41fe" },
        )
      end

      sig { void }
      def self.create_product_uuids_for_codespaces
        # v0
        Billing::ProductUUID.create!(
          product_type: ::Billing::Codespaces::ZuoraProduct.product_type,
          product_key: ::Billing::Codespaces::ZuoraProduct.product_key,
          billing_cycle: "month",
          zuora_product_id: "2c92c0f873d7f72f0173de3853aa03c1",
          zuora_product_rate_plan_id: "2c92c0f873d7f7400173de3854c767ae",
          zuora_product_rate_plan_charge_ids: {
            compute: "2c92c0f973d809be0173de3855da2ff9",
            storage: "2c92c0f973d809be0173de38560d3003"
          },
        )

        # v1
        Billing::Codespaces::RatePlan.new
      end

      sig { void }
      def self.create_product_uuids_for_advanced_security
        Billing::ProductUUID.create!(
          product_type: "github.advanced_security",
          product_key: "v0",
          billing_cycle: "month",
          zuora_product_id: "8ad09fc283ac6e180183b38857253a09",
          zuora_product_rate_plan_id: "8ad08e0183ac566c0183b3885cb92c2d",
          zuora_product_rate_plan_charge_ids: { unit: "8ad08e0183ac566c0183b3885d902c2f" },
          name: "GitHub Advanced Security",
          bill_on_trial_expiration: false,
          charges: [{
            "name" => "GitHub Advanced Security",
            "type" => "unit",
            "price" => 49,
            "billing_duration" => "month",
            "zuora_product_rate_plan_charge_id" => "8ad08e0183ac566c0183b3885d902c2f"
          }]
        )

        Billing::ProductUUID.create!(
          product_type: "github.advanced_security",
          product_key: "v0",
          billing_cycle: "year",
          zuora_product_id: "8ad09fc283ac6e180183b38857253a09",
          zuora_product_rate_plan_id: "8ad08e0183ac566c0183b3885cb92c2d",
          zuora_product_rate_plan_charge_ids: { unit: "8ad08e0183ac566c0183b3885d902c2f" },
          name: "GitHub Advanced Security",
          charges: [{
            "name" => "GitHub Advanced Security",
            "type" => "unit",
            "price" => 588,
            "billing_duration" => "year",
            "zuora_product_rate_plan_charge_id" => "8ad08e0183ac566c0183b3885d902c2f"
          }]
        )
      end

      sig { void }
      def self.create_product_uuids_for_lfs
        # billing-platform product
        Billing::ProductUUID.create!(
          product_type: "github.git_lfs",
          product_key: "GitHub LFS Usage",
          billing_cycle: "month",
          zuora_product_id: "8ad08e1a8876289c01887885c7dd14de",
          zuora_product_rate_plan_id: "8ad094088a02a333018a0516b4e01213",
          zuora_product_rate_plan_charge_ids: {
            "github_lfs_usage": "8ad081c68a0292d1018a05184aa80e90"
          },
          name: "GitHub LFS Usage",
          metered: true,
          charges: [{
            "name" => "GitHub LFS Usage",
            "type" => "per_unit",
            "price" => 1.0,
            "billing_duration" => "month",
            "zuora_product_rate_plan_charge_id" => "8ad081c68a0292d1018a05184aa80e90"
          }]
        )
      end
    end
  end
end
