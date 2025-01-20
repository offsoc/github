# frozen_string_literal: true
module AWSNamespaceCleanerClient
  def self.s3_production_data_cleaner_client
    @s3_production_data_cleaner_client ||= Aws::S3::Client.new(
      access_key_id: s3_production_data_cleaner_access_key,
      secret_access_key: s3_production_data_cleaner_secret_key,
      region: "us-east-1"
    )
  end

  def self.s3_production_data_cleaner_access_key
    ENV["AWS_CLEANUP_ACCESS_KEY_ID"]
  end

  def self.s3_production_data_cleaner_secret_key
    ENV["AWS_CLEANUP_SECRET_ACCESS_KEY"]
  end
end
