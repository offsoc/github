# frozen_string_literal: true

require_relative "./aws_namespace_cleaner_client"

class AWSNamespaceCleaner

  BUCKET = "github-production-registry-package-file-4f11e5"
  # https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/S3/Client.html#delete_objects-instance_method
  # The request contains a list of up to 1000 keys that you want to delete.
  MAX_FILES_PER_DELETE_REQUEST = 1000
  PACKAGE_TYPE_DOCKER = Registry::Package.package_types.key(Registry::Package.package_types[:docker])
  DB_UPDATE_BATCH_SIZE = 1000
  MAX_RETRIES = 5

  def initialize(owner_id:, readonly: true, bucket: BUCKET, batch_size: MAX_FILES_PER_DELETE_REQUEST, db_update_batch_size: DB_UPDATE_BATCH_SIZE, package_type: PACKAGE_TYPE_DOCKER)
    @owner_id = owner_id
    @readonly = readonly
    @bucket = bucket
    @batch_size = batch_size
    @db_update_batch_size = db_update_batch_size
    @package_type = package_type
    @owner = User.where(id: owner_id).first
    if @owner.nil?
      p "owner not found #{owner_id}"
    else
      @owner_id = @owner.id
      @namespace = @owner.login
    end

    # S3 client for the "GitHub (Production Data) AWS" account in Okta
    # with "s3:DeleteObjectVersion" and "s3:ListBucketVersions" scopes
    # https://github.com/github/security-iam/issues/5192
    @s3 = AWSNamespaceCleanerClient.s3_production_data_cleaner_client
  end

  def clean
    GitHub.logger.info(
      "Clean request started",
      "code.function" => __method__,
      "code.namespace" => self.class.name,
      "gh.aws_namespace_cleaner.readonly" => @readonly,
      "gh.aws_namespace_cleaner.namespace" => @namespace,
      "gh.aws_namespace_cleaner.owner_id" => @owner_id,
      "gh.aws_namespace_cleaner.batch_size" => @batch_size,
    )
    validate_namespace_migration(owner: @owner)
    @files = get_files_for_cleanup
    if !@files.empty?
      p "found files to be deleted : #{@files.length}"
    else
      p "no files to be deleted"
      return true
    end
    GitHub.logger.info(
      "Discovered files for deletion",
      "code.function" => __method__,
      "code.namespace" => self.class.name,
      "gh.aws_namespace_cleaner.namespace" => @namespace,
      "gh.aws_namespace_cleaner.owner_id" => @owner_id,
      "gh.aws_namespace_cleaner.count" => @files.length,
    )
    batch_files = []
    file_guids = []
    failed_count = 0
    files_updated_in_db = 0
    no_files_found_in_s3 = true
    file_not_in_s3_guids = []
    @files.each do |file|
      key = "#{file[:repository_id]}/#{file[:package_file_guid]}"
      file_versions = []
      req = {
          bucket: @bucket,
          prefix: key
      }
      while true
        # https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/S3/Client.html#list_object_versions-instance_method
        resp = @s3.list_object_versions(req)
        resp.delete_markers.each do |delete_marker|
          file_versions.push({
              key: delete_marker.key,
              version_id: delete_marker.version_id
          })
        end
        resp.versions.each do |version|
          file_versions.push({
              key: version.key,
              version_id: version.version_id
          })
        end
        if resp.is_truncated
          req["version_id_marker"] = resp.next_version_id_marker
          req["key_marker"] = resp.next_key_marker
        else
          break
        end
      end

      if file_versions.length == 0
        p "No versions found for #{key} adding #{file[:package_file_guid]} to file_not_in_s3_guids"
        file_not_in_s3_guids.push(file[:package_file_guid])
        next
      end

      while batch_files.length + file_versions.length > @batch_size
        space = @batch_size - batch_files.length
        slice = file_versions[...space]
        remaining = file_versions[space...]
        batch_files += slice
        file_versions = remaining
        ret_failed_count, ret_files_updated_in_db = delete_objects_in_batch(objects: batch_files, guids: file_guids)
        failed_count += ret_failed_count
        files_updated_in_db += ret_files_updated_in_db
        batch_files = []
        file_guids = []
      end

      batch_files += file_versions
      file_guids.push(file[:package_file_guid])
    end


    if file_not_in_s3_guids.length > 0
      p "Updating files in Db which are not present in S3"
      GitHub.logger.info(
        "Updating files in Db which are not present in S3",
        "code.function" => __method__,
        "code.namespace" => self.class.name,
        "gh.aws_namespace_cleaner.namespace" => @namespace,
        "gh.aws_namespace_cleaner.owner_id" => @owner_id,
      )

      files_updated_in_db += save_file_deleted_state_bulk(guids: file_not_in_s3_guids)
    end

    if batch_files.length > 0
      ret_failed_count, ret_files_updated_in_db = delete_objects_in_batch(objects: batch_files, guids: file_guids)
      failed_count += ret_failed_count
      files_updated_in_db += ret_files_updated_in_db
    end

    cleaned = (failed_count == 0)
    if cleaned
      GitHub.logger.info(
        "Namespace was successfully cleaned up",
        "code.function" => __method__,
        "code.namespace" => self.class.name,
        "gh.aws_namespace_cleaner.namespace" => @namespace,
        "gh.aws_namespace_cleaner.owner_id" => @owner_id,
      )
    end

    if files_updated_in_db != @files.length
      GitHub.logger.error(
        "Files were deleted from S3 but some were not updated in the database",
        "code.function" => __method__,
        "code.namespace" => self.class.name,
        "gh.aws_namespace_cleaner.namespace" => @namespace,
        "gh.aws_namespace_cleaner.owner_id" => @owner_id,
      )
    end

    cleaned && files_updated_in_db == @files.length
  end

  def get_files_for_cleanup
    GitHub.logger.info(
      "Retrieving list of files to be deleted",
      "code.function" => __method__,
      "code.namespace" => self.class.name,
      "gh.aws_namespace_cleaner.namespace" => @namespace,
      "gh.aws_namespace_cleaner.owner_id" => @owner_id,
    )
    files = []
    ActiveRecord::Base.connected_to(role: :reading) do
      packages = Registry::Package.where(owner_id: @owner_id, package_type: @package_type)
      packages.each do |package|
        package.package_versions.each do |package_version|
          package_version.files.where(deleted: false).each do |package_file|
            files.push({
                repository_id: package.repository_id,
                package_file_guid: package_file.guid
              })
          end
        end
      end
    end
    files
  end


  private

  def validate_namespace_migration(owner:)
    if owner.nil?
      p "Owner is nil, skipping validation"
      return
    end
    unless GitHub.flipper[:packages_docker_v1_migrated].enabled?(owner)
      raise "Owner is not migrated"
    end
  end

  def delete_objects_in_batch(objects:, guids:)
    GitHub.logger.info(
      "Deleting objects in batch",
      "code.function" => __method__,
      "code.namespace" => self.class.name,
      "gh.aws_namespace_cleaner.objects" => objects,
      "gh.aws_namespace_cleaner.readonly" => @readonly,
    )
    failed_count = 0
    updated = 0
    request_input = {
        bucket: @bucket,
        delete: {
            objects: objects,
            quiet: true
        }
    }

    if @readonly
      GitHub.logger.info(
        "Delete request not sent to s3 in readonly mode",
        "code.function" => __method__,
        "code.namespace" => self.class.name,
        "gh.aws_namespace_cleaner.namespace" => @namespace,
        "gh.aws_namespace_cleaner.owner_id" => @owner_id,
      )
      puts "I would have initiated the following delete request but current instance is in readonly mode"
      puts "request: #{request_input}"
      return -1, 0
    end

    # https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/S3/Client.html#delete_objects-instance_method
    resp = @s3.delete_objects(request_input)

    # https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/S3/Types/Error.html
    resp.errors.each do |error|
      GitHub.logger.error(error)
      guid = error.key.split("/").second
      guids.delete(guid)
      failed_count += 1
    end

    if resp.errors.length > 0
      GitHub.logger.info(
        "S3 deletion failed for one or more objects",
        "code.function" => __method__,
        "code.namespace" => self.class.name,
        "gh.aws_namespace_cleaner.namespace" => @namespace,
        "gh.aws_namespace_cleaner.owner_id" => @owner_id,
        "gh.aws_namespace_cleaner.errors" => resp.errors,
      )
    end


    # as we getting guid from DB only no need to check if it exists and save the deleted status, bulk update will improve perf as well.
    updated = save_file_deleted_state_bulk(guids: guids)

    [failed_count, updated]
  end

  def save_file_deleted_state_bulk(guids:)
    updated = 0
    guids.each_slice(@db_update_batch_size) do |slice|
      ActiveRecord::Base.connected_to(role: :writing) do
        Registry::File.throttle_with_retry(max_retry_count: MAX_RETRIES) do
          updated += Registry::File.where(guid: slice).update_all(deleted: true)
        end
      end
    end
    updated
  end

  def save_file_deleted_state(guid:, deleted:)
    file = Registry::File.where(guid: guid).first
    if file.nil?
      GitHub.logger.info(
        "Cannot update deleted status because file does not exist in database",
        "code.function" => __method__,
        "code.namespace" => self.class.name,
        "gh.aws_namespace_cleaner.namespace" => @namespace,
        "gh.aws_namespace_cleaner.owner_id" => @owner_id,
        "gh.aws_namespace_cleaner.guid" => guid,
        "gh.aws_namespace_cleaner.deleted" => deleted,
      )
    else
      file.deleted = deleted
      file.save!
    end
  end

end
