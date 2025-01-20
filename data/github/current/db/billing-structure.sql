DROP TABLE IF EXISTS `actions_cache_usages`;
CREATE TABLE `actions_cache_usages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `repository_id` bigint unsigned NOT NULL,
  `owner_id` bigint unsigned NOT NULL,
  `active_caches_size` bigint unsigned NOT NULL DEFAULT '0',
  `active_caches_count` int unsigned NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_actions_cache_usages_on_repository_id` (`repository_id`),
  KEY `index_actions_cache_usages_on_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `apple_subscriptions`;
CREATE TABLE `apple_subscriptions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `subscription_item_id` bigint unsigned NOT NULL COMMENT 'Reference to the subscription_items table.',
  `original_transaction_id` varchar(64) COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'The original transaction ID for the purchase as provided by Apple. We can use this value to query Apple and request the most up-to-date info.',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_apple_subscriptions_on_subscription_item_id` (`subscription_item_id`),
  KEY `idx_apple_subscriptions_on_original_transaction_id` (`original_transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='Contains Apple in-app purchase data for subscription_items records.';
DROP TABLE IF EXISTS `billing_budgets`;
CREATE TABLE `billing_budgets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `owner_type` varchar(12) NOT NULL,
  `owner_id` bigint NOT NULL,
  `enforce_spending_limit` tinyint(1) NOT NULL DEFAULT '1',
  `spending_limit_in_subunits` bigint NOT NULL DEFAULT '0',
  `spending_limit_currency_code` varchar(3) NOT NULL DEFAULT 'USD',
  `product` enum('shared','codespaces') NOT NULL,
  `effective_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `budget_name` varchar(100) DEFAULT NULL,
  `notify_spending` tinyint(1) NOT NULL DEFAULT '1',
  `included_usage_notification` tinyint(1) NOT NULL DEFAULT '1',
  `paid_usage_notification` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_billing_budgets_on_owner_and_product_and_effective_at` (`owner_type`,`owner_id`,`product`,`effective_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `billing_disputes`;
CREATE TABLE `billing_disputes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `platform` int NOT NULL,
  `platform_dispute_id` varchar(255) COLLATE utf8mb3_bin NOT NULL,
  `amount_in_subunits` int NOT NULL DEFAULT '0',
  `currency_code` varchar(3) NOT NULL DEFAULT 'USD',
  `reason` varchar(255) NOT NULL DEFAULT 'general',
  `status` varchar(255) NOT NULL DEFAULT 'unknown',
  `refundable` tinyint(1) NOT NULL DEFAULT '0',
  `response_due_by` timestamp NULL DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `billing_transaction_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_billing_disputes_on_platform_and_platform_dispute_id` (`platform`,`platform_dispute_id`),
  KEY `index_billing_disputes_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `billing_external_emails`;
CREATE TABLE `billing_external_emails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_type` varchar(12) NOT NULL,
  `owner_id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_billing_external_emails_on_owner_id_and_email` (`owner_id`,`email`),
  KEY `index_billing_external_emails_on_owner_type_and_owner_id` (`owner_type`,`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `billing_key_values`;
CREATE TABLE `billing_key_values` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `value` blob NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_billing_key_values_on_key` (`key`),
  KEY `index_billing_key_values_on_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `billing_payouts_ledger_discrepancies`;
CREATE TABLE `billing_payouts_ledger_discrepancies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stripe_connect_account_id` int NOT NULL,
  `status` enum('unresolved','resolved') NOT NULL DEFAULT 'unresolved',
  `discrepancy_in_subunits` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_payouts_ledger_discrepancies_on_status_and_created_at` (`status`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `billing_payouts_ledger_entries`;
CREATE TABLE `billing_payouts_ledger_entries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `billing_transaction_id` bigint unsigned DEFAULT NULL,
  `stripe_connect_account_id` bigint unsigned NOT NULL,
  `sponsors_listing_id` bigint unsigned DEFAULT NULL,
  `invoiced_sponsorship_transfer_reversal_id` bigint unsigned DEFAULT NULL,
  `transaction_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `transaction_type` int NOT NULL,
  `amount_in_subunits` bigint NOT NULL DEFAULT '0',
  `currency_code` varchar(3) NOT NULL DEFAULT 'USD',
  `primary_reference_id` varchar(255) COLLATE utf8mb3_bin DEFAULT NULL,
  `zuora_transaction_id` varchar(255) DEFAULT NULL,
  `zuora_refund_id` varchar(255) DEFAULT NULL,
  `refunded_transaction_zuora_id` varchar(255) DEFAULT NULL,
  `stripe_charge_id` varchar(255) DEFAULT NULL,
  `stripe_refund_id` varchar(255) DEFAULT NULL,
  `refunded_transaction_stripe_id` varchar(255) DEFAULT NULL,
  `reversed_transfer_stripe_id` varchar(255) DEFAULT NULL,
  `paypal_id` varchar(255) DEFAULT NULL,
  `refunded_transaction_paypal_id` varchar(255) DEFAULT NULL,
  `credit_balance_adjustment_number` varchar(255) DEFAULT NULL,
  `refunded_transaction_credit_balance_adjustment_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_billing_payouts_ledger_entries_on_primary_reference_id` (`primary_reference_id`),
  KEY `index_ledger_entries_on_acct_id_and_txn_type_and_timestamp` (`stripe_connect_account_id`,`transaction_type`,`transaction_timestamp`),
  KEY `index_billing_payouts_ledger_entries_listing_txn_type_timestamp` (`sponsors_listing_id`,`transaction_type`,`transaction_timestamp`),
  KEY `index_billing_payouts_ledger_entries_on_zuora_transaction_id` (`zuora_transaction_id`),
  KEY `idx_billing_payouts_ledger_entries_invoice_sship_transf_reversal` (`invoiced_sponsorship_transfer_reversal_id`),
  KEY `idx_billing_payouts_ledger_entries_on_bill_transaction_type_time` (`billing_transaction_id`,`transaction_type`,`transaction_timestamp`),
  KEY `idx_billing_payouts_ledger_entries_on_charge_id_and_txn_type` (`stripe_charge_id`,`transaction_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `billing_prepaid_metered_usage_refills`;
CREATE TABLE `billing_prepaid_metered_usage_refills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_type` varchar(12) NOT NULL,
  `owner_id` int NOT NULL,
  `expires_on` date NOT NULL,
  `amount_in_subunits` int NOT NULL,
  `currency_code` varchar(3) NOT NULL DEFAULT 'USD',
  `zuora_rate_plan_charge_id` varchar(32) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `zuora_rate_plan_charge_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_billing_prepaid_metered_usage_refills_on_zuora_rpc_id` (`zuora_rate_plan_charge_id`),
  UNIQUE KEY `index_on_zuora_rate_plan_charge_number` (`zuora_rate_plan_charge_number`),
  KEY `idx_billing_prepaid_metered_usage_refills_on_owner_and_expiry` (`owner_id`,`owner_type`,`expires_on`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `billing_sales_serve_plan_subscriptions`;
CREATE TABLE `billing_sales_serve_plan_subscriptions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `zuora_subscription_id` varchar(32) DEFAULT NULL,
  `zuora_subscription_number` varchar(32) DEFAULT NULL,
  `billing_start_date` date NOT NULL,
  `zuora_rate_plan_charges` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `education_bundle` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_billing_sales_serve_plan_subscriptions_on_customer_id` (`customer_id`),
  UNIQUE KEY `index_billing_sales_serve_plan_subscriptions_on_zuora_sub_id` (`zuora_subscription_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `billing_transaction_tax_items`;
CREATE TABLE `billing_transaction_tax_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `billing_transaction_line_item_id` bigint unsigned NOT NULL,
  `amount_in_cents` int NOT NULL DEFAULT '0',
  `exempt_amount_in_cents` int NOT NULL DEFAULT '0',
  `country` varchar(3) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `name` varchar(128) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `jurisdiction` varchar(100) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `location_code` varchar(32) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `tax_code` varchar(32) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `tax_code_description` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `tax_date` date NOT NULL,
  `tax_rate` decimal(5,4) NOT NULL,
  `tax_rate_description` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `tax_rate_type` varchar(10) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `source_id` varchar(36) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `source_name` varchar(5) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_on_source_id_source_name_e828b9fab8` (`source_id`,`source_name`),
  KEY `idx_on_billing_transaction_line_item_id_71d129e9e7` (`billing_transaction_line_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `bundled_license_assignments`;
CREATE TABLE `bundled_license_assignments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `enterprise_agreement_number` varchar(128) NOT NULL,
  `business_id` bigint unsigned DEFAULT NULL,
  `email` varchar(320) NOT NULL,
  `subscription_id` varchar(36) NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `assigned_user_at` datetime DEFAULT NULL,
  `assigned_business_at` datetime DEFAULT NULL,
  `revoked_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_bundled_license_assignments_on_enterprise_agreement_number` (`enterprise_agreement_number`),
  KEY `index_bundled_license_assignments_on_business_id_and_email` (`business_id`,`email`),
  KEY `index_bundled_license_assignments_on_assigned_user_at` (`assigned_user_at`),
  KEY `index_bundled_license_assignments_on_assigned_business_at` (`assigned_business_at`),
  KEY `index_bundled_license_assignments_on_revoked_at` (`revoked_at`),
  KEY `index_bundled_license_assignments_on_subscription_id_and_email` (`subscription_id`,`email`),
  KEY `index_bundled_license_assignments_on_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `contacts`;
CREATE TABLE `contacts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `address_type` tinyint NOT NULL,
  `first_name` varchar(64) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `last_name` varchar(64) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `entity_name` varchar(800) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `address1` varchar(128) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `address2` varchar(128) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `city` varchar(64) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `region` varchar(64) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `postal_code` varchar(32) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `country_code` varchar(3) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `trade_screening_status` tinyint NOT NULL DEFAULT '0',
  `address_validated_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_contacts_on_customer_id_and_address_type` (`customer_id`,`address_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `credit_checks`;
CREATE TABLE `credit_checks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `status` tinyint NOT NULL DEFAULT '0',
  `request_id` varchar(32) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `customer_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_credit_checks_on_customer_id` (`customer_id`),
  KEY `index_credit_checks_on_status` (`status`),
  KEY `index_credit_checks_on_request_id` (`request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `enterprise_agreements`;
CREATE TABLE `enterprise_agreements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agreement_id` varchar(128) NOT NULL,
  `business_id` int NOT NULL,
  `category` int NOT NULL,
  `status` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `seats` int NOT NULL DEFAULT '0',
  `starts_at` datetime(6) DEFAULT NULL,
  `ends_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_enterprise_agreements_on_agreement_id` (`agreement_id`),
  KEY `index_enterprise_agreements_on_business_and_category_and_status` (`business_id`,`category`,`status`),
  KEY `index_enterprise_agreements_on_business_id_starts_at_ends_at` (`business_id`,`starts_at`,`ends_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `google_subscriptions`;
CREATE TABLE `google_subscriptions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `subscription_item_id` bigint unsigned NOT NULL COMMENT 'Reference to the subscription_items table.',
  `purchase_token` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL COMMENT 'The purchase token for the purchase as provided by Google. We can use this value to query Google and request the most up-to-date info.',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_google_subscriptions_on_subscription_item_id` (`subscription_item_id`),
  UNIQUE KEY `idx_google_subscriptions_on_purchase_token` (`purchase_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci COMMENT='Contains Google in-app purchase data for subscription_items records.';
DROP TABLE IF EXISTS `licensing_model_transitions`;
CREATE TABLE `licensing_model_transitions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL COMMENT 'The customer this transition is for',
  `transition_date` date NOT NULL COMMENT 'The date of the transition',
  `status` int NOT NULL DEFAULT '0' COMMENT 'The status of the transition',
  `licensing_model` int NOT NULL COMMENT 'The updated licensing model to apply',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `actor_id` bigint unsigned DEFAULT NULL,
  `message` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `ghas_only` tinyint(1) NOT NULL DEFAULT '0',
  `reset_ghas_configuration` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_licensing_model_transitions_on_customer_id` (`customer_id`),
  KEY `index_licensing_transitions_on_transition_date_and_customer_id` (`transition_date`,`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `manual_dunning_periods`;
CREATE TABLE `manual_dunning_periods` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `notification_attempts` int DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_manual_dunning_periods_on_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `metered_usage_exports`;
CREATE TABLE `metered_usage_exports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `starts_on` date NOT NULL,
  `ends_on` date NOT NULL,
  `filename` varchar(255) NOT NULL,
  `billable_owner_type` varchar(12) NOT NULL,
  `billable_owner_id` bigint unsigned NOT NULL,
  `requester_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_azure_blob_storage` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_metered_usage_exports_on_filename` (`filename`),
  KEY `idx_metered_usage_exports_billable_owner` (`billable_owner_type`,`billable_owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `plan_trials`;
CREATE TABLE `plan_trials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `pending_plan_change_id` int NOT NULL,
  `plan` varchar(30) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_plan_trials_on_user_id_and_plan` (`user_id`,`plan`),
  KEY `index_plan_trials_on_pending_plan_change_id` (`pending_plan_change_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `sales_serve_subscription_change_request_items`;
CREATE TABLE `sales_serve_subscription_change_request_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `change_request_id` bigint unsigned NOT NULL,
  `status` tinyint unsigned NOT NULL DEFAULT '0',
  `product_rate_plan_charge_id` varchar(32) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `change_type` tinyint unsigned NOT NULL,
  `quantity` int unsigned DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `start_date` datetime(6) NOT NULL,
  `end_date` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_sales_serve_sub_change_request_items_on_change_request_id` (`change_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `sales_serve_subscription_change_requests`;
CREATE TABLE `sales_serve_subscription_change_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `request_uuid` varchar(36) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `customer_id` bigint unsigned NOT NULL,
  `zuora_subscription_id` varchar(32) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_sales_serve_sub_change_requests_on_request_uuid` (`request_uuid`),
  KEY `index_sales_serve_sub_change_requests_on_customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `shared_storage_artifact_events`;
CREATE TABLE `shared_storage_artifact_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned DEFAULT NULL,
  `effective_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `source` enum('unknown','actions','gpr','ghcr','packages_v2') COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'unknown',
  `repository_visibility` enum('unknown','public','private') NOT NULL DEFAULT 'unknown',
  `event_type` enum('unknown','add','remove') NOT NULL DEFAULT 'unknown',
  `size_in_bytes` bigint NOT NULL,
  `aggregation_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `source_artifact_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_shared_storage_artifact_events_on_owner_repo_time_agg` (`owner_id`,`repository_id`,`effective_at`,`aggregation_id`),
  KEY `index_on_fields_for_artifact_expiration` (`source`,`event_type`,`owner_id`,`effective_at`,`repository_id`,`size_in_bytes`),
  KEY `index_on_fields_for_stafftools_shared_storage_breakdown` (`owner_id`,`repository_visibility`,`effective_at`,`repository_id`,`source`,`aggregation_id`,`event_type`,`size_in_bytes`),
  KEY `index_shared_storage_artifact_events_on_source_artifact_id` (`source_artifact_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `shared_storage_usage`;
CREATE TABLE `shared_storage_usage` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `billable_owner_type` enum('User','Business') COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `billable_owner_id` bigint unsigned NOT NULL,
  `owner_id` bigint unsigned NOT NULL,
  `repository_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT 'This column needs to be NOT NULL using a value of 0 instead of NULL in order to enforce the repository_id, owner_id unique constraint since MySql allows multiple NULL values in a unique constraint.',
  `effective_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `repository_visibility` enum('private','public','unknown') COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT 'unknown',
  `aggregate_size_in_bytes` bigint unsigned NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_shared_storage_usage_on_repo_and_owner` (`repository_id`,`owner_id`),
  KEY `index_shared_storage_usage_on_query_fields` (`billable_owner_id`,`billable_owner_type`,`repository_visibility`),
  KEY `index_shared_storage_usage_on_query_fields_and_owner` (`billable_owner_id`,`billable_owner_type`,`owner_id`,`repository_visibility`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `stripe_connect_accounts`;
CREATE TABLE `stripe_connect_accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sponsors_listing_id` bigint unsigned NOT NULL DEFAULT '0',
  `stripe_account_id` varchar(255) COLLATE utf8mb3_bin NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `default_currency` char(3) DEFAULT NULL,
  `payout_interval` varchar(10) DEFAULT NULL,
  `disabled_reason` varchar(255) DEFAULT NULL,
  `billing_country` char(2) DEFAULT NULL,
  `country` char(2) DEFAULT NULL,
  `verification_status` int NOT NULL DEFAULT '0',
  `details_submitted` tinyint(1) NOT NULL DEFAULT '0',
  `current_requirements_deadline` datetime(6) DEFAULT NULL,
  `requirements_eventually_due` tinyint(1) NOT NULL DEFAULT '0',
  `requirements_past_due` tinyint(1) NOT NULL DEFAULT '0',
  `requirements_currently_due` tinyint(1) NOT NULL DEFAULT '0',
  `w8_or_w9_requested_at` datetime(6) DEFAULT NULL,
  `w8_or_w9_verified` tinyint(1) NOT NULL DEFAULT '0',
  `transfers_capability` tinyint(1) NOT NULL DEFAULT '0',
  `card_payments_capability` tinyint(1) NOT NULL DEFAULT '0',
  `tax_reporting_capability` tinyint(1) NOT NULL DEFAULT '0',
  `charges_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `payouts_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_stripe_connect_accounts_on_stripe_account_id` (`stripe_account_id`),
  KEY `idx_stripe_connect_accounts_sponsors_listing_id_payouts_enabled` (`sponsors_listing_id`,`payouts_enabled`),
  KEY `idx_stripe_connect_accounts_sponsors_listing_id_billing_country` (`sponsors_listing_id`,`billing_country`),
  KEY `idx_stripe_connect_accounts_spon_listing_id_verif_status_country` (`sponsors_listing_id`,`verification_status`,`country`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `subscription_sync_statuses`;
CREATE TABLE `subscription_sync_statuses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `target_type` varchar(255) NOT NULL,
  `target_id` bigint NOT NULL,
  `external_sync_status` enum('success','pending','failure','declined','under_investigation','failed_but_retrying','suspended') COLLATE utf8mb3_general_ci NOT NULL,
  `plan_subscription_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `investigation_notes` varchar(255) DEFAULT NULL,
  `number_of_retries_remaining` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `index_subscription_sync_statuses_on_plan_subscription_id` (`plan_subscription_id`),
  KEY `index_subscription_sync_statuses_on_target_id_and_target_type` (`target_id`,`target_type`),
  KEY `idx_on_external_sync_status_updated_at_5a92b0642b` (`external_sync_status`,`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `tax_exemption_statuses`;
CREATE TABLE `tax_exemption_statuses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `status` tinyint NOT NULL DEFAULT '0',
  `customer_id` bigint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `certificate_name` varchar(48) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `status_reason` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_tax_exemption_statuses_on_customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
DROP TABLE IF EXISTS `usage_line_items`;
CREATE TABLE `usage_line_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `product_sku_id` bigint unsigned NOT NULL,
  `product_rate_plan_id` bigint unsigned NOT NULL,
  `origin_type` enum('unknown','github_dotcom','enterprise_installation') NOT NULL,
  `origin_id` bigint unsigned DEFAULT NULL,
  `billable_owner_type` enum('User','Business') NOT NULL,
  `billable_owner_id` bigint unsigned NOT NULL,
  `account_type` enum('User','Business') NOT NULL,
  `account_id` bigint unsigned NOT NULL,
  `actor_id` bigint unsigned DEFAULT NULL,
  `usage_uuid` varchar(36) NOT NULL,
  `usage_at` datetime(6) NOT NULL,
  `quantity` decimal(22,9) NOT NULL DEFAULT '0.000000000',
  `unit_of_measure_id` bigint unsigned NOT NULL,
  `source_uri` varchar(255) NOT NULL,
  `kafka_data` text COLLATE utf8mb3_general_ci,
  `rate_plan_multiplier` decimal(12,9) NOT NULL DEFAULT '1.000000000',
  `effective_quantity` decimal(22,9) NOT NULL DEFAULT '0.000000000',
  `billable_quantity` decimal(22,9) DEFAULT NULL,
  `billable_quantity_reason` varchar(24) DEFAULT NULL,
  `rate_plan_unit_price` decimal(12,9) NOT NULL,
  `estimated_cost` decimal(22,9) NOT NULL DEFAULT '0.000000000',
  `currency_code` varchar(3) NOT NULL,
  `submission_target` enum('zuora','azure') NOT NULL,
  `submission_state` enum('unprocessed','skipped','submitted','aggregated') NOT NULL DEFAULT 'unprocessed',
  `submission_state_reason` varchar(24) DEFAULT NULL,
  `disposition_type` varchar(255) DEFAULT NULL,
  `disposition_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_usage_line_items_on_usage_uuid` (`usage_uuid`),
  KEY `index_usage_line_items_on_source_uri` (`source_uri`),
  KEY `index_on_submission_state_and_reason` (`submission_state`,`submission_state_reason`),
  KEY `index_on_disposition` (`disposition_type`,`disposition_id`),
  KEY `index_on_billable_owner_and_account_and_actor_and_usage_at` (`billable_owner_type`,`billable_owner_id`,`account_type`,`account_id`,`actor_id`,`usage_at`),
  KEY `index_on_billable_owner_product_and_usage_at` (`billable_owner_id`,`billable_owner_type`,`product_id`,`usage_at`),
  KEY `index_on_billable_owner_submission_state_usage_at` (`billable_owner_type`,`billable_owner_id`,`submission_state`,`usage_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `vss_subscription_events`;
CREATE TABLE `vss_subscription_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payload` text,
  `status` enum('unprocessed','processed','failed','under_investigation') COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'unprocessed',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `investigation_notes` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_vss_subscription_events_on_status_and_created_at` (`status`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
DROP TABLE IF EXISTS `zuora_rate_plan_charges`;
CREATE TABLE `zuora_rate_plan_charges` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `plan_subscription_id` bigint unsigned NOT NULL,
  `product_rate_plan_charge_id` varchar(32) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `payload` json NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `plan_subscription_type` varchar(35) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_zuora_rate_plan_charges_on_product_rate_plan_charge_id` (`product_rate_plan_charge_id`),
  KEY `idx_on_plan_subscription_id_plan_subscription_type_7e93231698` (`plan_subscription_id`,`plan_subscription_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
