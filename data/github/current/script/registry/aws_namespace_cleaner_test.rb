# frozen_string_literal: true

require "test_helper"
require_relative "./aws_namespace_cleaner"

class AWSNamespaceCleanerTest < GitHub::TestCase
  include GitHub::RegistryPackageHelper


  def setup
    s3 = Aws::S3::Client.new(stub_responses: true)
    AWSNamespaceCleanerClient.stubs(:s3_production_data_cleaner_client).returns(s3)
  end

  context "get_files_for_cleanup" do
    test "get_files_for_cleanup retrieves filenames for all versions of a docker package" do
      user = create :user, login: "test-user", password: GitHub.default_password
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg_v2 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.2")
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file1", size: 1)
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file2", size: 1)
      docker_pkg_v2.files << Registry::File.new(filename: "docker-file2", size: 1)
      docker_pkg_v2.files << Registry::File.new(filename: "docker-file3", size: 1)
      docker_pkg_v1.save
      docker_pkg_v2.save
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.package_versions << docker_pkg_v2
      docker_pkg.save

      expected_file_guids = (docker_pkg_v1.files + docker_pkg_v2.files).pluck(:guid)

      cleaner = AWSNamespaceCleaner.new(owner_id: user.id)
      actual_file_guids = cleaner.get_files_for_cleanup.pluck(:package_file_guid)

      assert_equal expected_file_guids, actual_file_guids
    end


    test "get_files_for_cleanup retrieves filenames for all versions of a docker package where owner is not present" do
      user = create :user, login: "test-user", password: GitHub.default_password
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg_v2 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.2")
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file1", size: 1)
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file2", size: 1)
      docker_pkg_v2.files << Registry::File.new(filename: "docker-file2", size: 1)
      docker_pkg_v2.files << Registry::File.new(filename: "docker-file3", size: 1)
      docker_pkg_v1.save
      docker_pkg_v2.save
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.package_versions << docker_pkg_v2
      docker_pkg.save

      owner_id = user.id
      user.delete
      repo.delete

      expected_file_guids = (docker_pkg_v1.files + docker_pkg_v2.files).pluck(:guid)

      cleaner = AWSNamespaceCleaner.new(owner_id: user.id)
      actual_file_guids = cleaner.get_files_for_cleanup.pluck(:package_file_guid)

      assert_equal expected_file_guids, actual_file_guids
    end

    test "get_files_for_cleanup retrieves filenames for all docker packages and their versions" do
      user = create :user, login: "test-user", password: GitHub.default_password
      repo1 = create :repository, owner: user
      example_repo :repository_test_simple, repo1
      repo2 = create :repository, owner: user
      example_repo :repository_test_simple, repo2

      docker_pkg1 = Registry::Package.new(
          name: "test-pkg-1",
          repository: repo1,
          owner: repo1.owner,
          package_type: :docker
      )
      docker_pkg1_v1 = make_registry_package_version(registry_package: docker_pkg1, tag_name: "0.0.1")
      docker_pkg1_v2 = make_registry_package_version(registry_package: docker_pkg1, tag_name: "0.0.2")
      docker_pkg1.package_versions << docker_pkg1_v1
      docker_pkg1.package_versions << docker_pkg1_v2
      docker_pkg1.save

      docker_pkg2 = Registry::Package.new(
          name: "test-pkg-2",
          repository: repo2,
          owner: repo2.owner,
          package_type: :docker
      )
      docker_pkg2_v1 = make_registry_package_version(registry_package: docker_pkg2, tag_name: "0.0.1")
      docker_pkg2_v2 = make_registry_package_version(registry_package: docker_pkg2, tag_name: "0.0.2")
      docker_pkg2.package_versions << docker_pkg2_v1
      docker_pkg2.package_versions << docker_pkg2_v2
      docker_pkg2.save


      expected_files = []
      expected_files += docker_pkg1_v1.files
      expected_files += docker_pkg1_v2.files
      expected_files += docker_pkg2_v1.files
      expected_files += docker_pkg2_v2.files
      expected_file_guids = expected_files.pluck(:guid)

      cleaner = AWSNamespaceCleaner.new(owner_id: user.id)
      actual_file_guids = cleaner.get_files_for_cleanup.pluck(:package_file_guid)

      assert_equal expected_file_guids, actual_file_guids
    end

    test "get_files_for_cleanup retrieves filenames for all docker packages linked to same repository and their versions" do
      user = create :user, login: "test-user", password: GitHub.default_password
      repo1 = create :repository, owner: user
      example_repo :repository_test_simple, repo1

      docker_pkg1 = Registry::Package.new(
          name: "test-pkg-1",
          repository: repo1,
          owner: repo1.owner,
          package_type: :docker
      )
      docker_pkg1_v1 = make_registry_package_version(registry_package: docker_pkg1, tag_name: "0.0.1")
      docker_pkg1_v2 = make_registry_package_version(registry_package: docker_pkg1, tag_name: "0.0.2")
      docker_pkg1.package_versions << docker_pkg1_v1
      docker_pkg1.package_versions << docker_pkg1_v2
      docker_pkg1.save

      docker_pkg2 = Registry::Package.new(
          name: "test-pkg-2",
          repository: repo1,
          owner: repo1.owner,
          package_type: :docker
      )
      docker_pkg2_v1 = make_registry_package_version(registry_package: docker_pkg2, tag_name: "0.0.3")
      docker_pkg2_v2 = make_registry_package_version(registry_package: docker_pkg2, tag_name: "0.0.4")
      docker_pkg2.package_versions << docker_pkg2_v1
      docker_pkg2.package_versions << docker_pkg2_v2
      docker_pkg2.save


      expected_files = []
      expected_files += docker_pkg1_v1.files
      expected_files += docker_pkg1_v2.files
      expected_files += docker_pkg2_v1.files
      expected_files += docker_pkg2_v2.files
      expected_file_guids = expected_files.pluck(:guid)

      cleaner = AWSNamespaceCleaner.new(owner_id: user.id)
      actual_file_guids = cleaner.get_files_for_cleanup.pluck(:package_file_guid)

      assert_equal expected_file_guids, actual_file_guids
    end

    test "get_files_for_cleanup retrieves filenames only for docker packages" do
      user = create :user, login: "test-user", password: GitHub.default_password
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg_v2 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.2")
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.package_versions << docker_pkg_v2
      docker_pkg.save

      npm_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :npm
      )
      npm_pkg_v1 = make_registry_package_version(registry_package: npm_pkg, tag_name: "0.0.3")
      npm_pkg_v2 = make_registry_package_version(registry_package: npm_pkg, tag_name: "0.0.4")
      npm_pkg.package_versions << npm_pkg_v1
      npm_pkg.package_versions << npm_pkg_v2
      npm_pkg.save

      expected_files = []
      expected_files += docker_pkg_v1.files
      expected_files += docker_pkg_v2.files
      expected_file_guids = expected_files.pluck(:guid)

      cleaner = AWSNamespaceCleaner.new(owner_id: user.id)
      actual_file_guids = cleaner.get_files_for_cleanup.pluck(:package_file_guid)

      assert_equal expected_file_guids, actual_file_guids
    end

    test "get_files_for_cleanup retrieves filenames only for the given namespace" do
      user1 = create :user, login: "test-user-1", password: GitHub.default_password
      user2 = create :user, login: "test-user-2", password: GitHub.default_password
      repo1 = create :repository, owner: user1
      example_repo :repository_test_simple, repo1
      repo2 = create :repository, owner: user2
      example_repo :repository_test_simple, repo2

      docker_pkg1 = Registry::Package.new(
          name: "test-pkg-1",
          repository: repo1,
          owner: repo1.owner,
          package_type: :docker
      )
      docker_pkg1_v1 = make_registry_package_version(registry_package: docker_pkg1, tag_name: "0.0.1")
      docker_pkg1_v2 = make_registry_package_version(registry_package: docker_pkg1, tag_name: "0.0.2")
      docker_pkg1.package_versions << docker_pkg1_v1
      docker_pkg1.package_versions << docker_pkg1_v2
      docker_pkg1.save

      docker_pkg2 = Registry::Package.new(
          name: "test-pkg-2",
          repository: repo2,
          owner: repo2.owner,
          package_type: :docker
      )
      docker_pkg2_v1 = make_registry_package_version(registry_package: docker_pkg2, tag_name: "0.0.1")
      docker_pkg2_v2 = make_registry_package_version(registry_package: docker_pkg2, tag_name: "0.0.2")
      docker_pkg2.package_versions << docker_pkg2_v1
      docker_pkg2.package_versions << docker_pkg2_v2
      docker_pkg2.save


      expected_files = []
      expected_files += docker_pkg1_v1.files
      expected_files += docker_pkg1_v2.files
      expected_file_guids = expected_files.pluck(:guid)

      cleaner = AWSNamespaceCleaner.new(owner_id: user1.id)
      actual_file_guids = cleaner.get_files_for_cleanup.pluck(:package_file_guid)

      assert_equal expected_file_guids, actual_file_guids
    end

    test "clean raises error for unmigrated namespace" do
      user = create :user, login: "test-user", password: GitHub.default_password
      assert_raises "Owner is not migrated" do
        AWSNamespaceCleaner.new(owner_id: user.id).clean
      end
    end

    test "get_files_for_cleanup retrieves only non-deleted files" do
      user = create :user, login: "test-user", password: GitHub.default_password
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg_v2 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.2")
      deleted_file = Registry::File.new(filename: "deleted-file", size: 1)
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file1", size: 1)
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file2", size: 1)
      docker_pkg_v2.files << Registry::File.new(filename: "docker-file2", size: 1)
      docker_pkg_v2.files << Registry::File.new(filename: "docker-file3", size: 1)
      docker_pkg_v2.files << deleted_file
      deleted_file.deleted = true
      deleted_file.save!
      docker_pkg_v1.save
      docker_pkg_v2.save
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.package_versions << docker_pkg_v2
      docker_pkg.save

      expected_file_guids = (docker_pkg_v1.files + docker_pkg_v2.files).pluck(:guid)
      expected_file_guids.delete(deleted_file.guid)

      cleaner = AWSNamespaceCleaner.new(owner_id: user.id)
      actual_file_guids = cleaner.get_files_for_cleanup.pluck(:package_file_guid)

      assert_equal expected_file_guids, actual_file_guids
      assert_nil actual_file_guids.find_index(deleted_file.guid)
    end

  end

  context "AWS S3 HTTP Requests" do
    test "S3 delete is not invoked for files not present in AWS S3 and DB status is updated" do
      user = create :user, login: "test-user", password: GitHub.default_password
      GitHub.flipper[:packages_docker_v1_migrated].enable(user)
      repo1 = create :repository, owner: user
      example_repo :repository_test_simple, repo1
      repo2 = create :repository, owner: user
      example_repo :repository_test_simple, repo2

      docker_pkg1 = Registry::Package.new(
          name: "test-pkg-1",
          repository: repo1,
          owner: repo1.owner,
          package_type: :docker
      )
      docker_pkg1_v1 = make_registry_package_version(registry_package: docker_pkg1, tag_name: "0.0.1")
      docker_pkg1_v2 = make_registry_package_version(registry_package: docker_pkg1, tag_name: "0.0.2")
      docker_pkg1.package_versions << docker_pkg1_v1
      docker_pkg1.package_versions << docker_pkg1_v2
      docker_pkg1.save

      docker_pkg2 = Registry::Package.new(
          name: "test-pkg-2",
          repository: repo2,
          owner: repo2.owner,
          package_type: :docker
      )
      docker_pkg2_v1 = make_registry_package_version(registry_package: docker_pkg2, tag_name: "0.0.1")
      docker_pkg2_v2 = make_registry_package_version(registry_package: docker_pkg2, tag_name: "0.0.2")
      docker_pkg2.package_versions << docker_pkg2_v1
      docker_pkg2.package_versions << docker_pkg2_v2
      docker_pkg2.save

      s3 = Aws::S3::Client.new(stub_responses: true)
      AWSNamespaceCleanerClient.stubs(:s3_production_data_cleaner_client).returns(s3)
      objects = []
      pkg_files = docker_pkg1.package_files + docker_pkg2.package_files

      docker_pkg1.package_files.each do |file|
        key = "#{repo1.id}/#{file.guid}"
        p "key: #{key}"

        s3.expects(:list_object_versions).with(
            bucket: AWSNamespaceCleaner::BUCKET,
            prefix: key
        ).once.returns(
            Aws::S3::Types::ListObjectVersionsOutput.new(
                delete_markers: [],
                versions: [],
                is_truncated: false
            )
        )
      end
      docker_pkg2.package_files.each do |file|
        key = "#{repo2.id}/#{file.guid}"

        delete_marker_ids = [
            "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
        ]
        version_ids = %w[
            etwQFlGfNwJzTqn2or47IvfX6e8bqMxC
            CSayBA3DDwdIpXoZcZACoDFZUE3sb6LG
        ]
        delete_markers = delete_marker_ids.map { |id| { key: key, version_id: id } }
        versions = version_ids.map { |id| { key: key, version_id: id } }
        objects += delete_markers + versions

        s3.expects(:list_object_versions).with(
            bucket: AWSNamespaceCleaner::BUCKET,
            prefix: key
        ).once.returns(
            Aws::S3::Types::ListObjectVersionsOutput.new(
                delete_markers: delete_markers.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
                versions: versions.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
                is_truncated: false
            )
        )
      end

      s3.expects(:delete_objects).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          delete: {
              objects: objects,
              quiet: true
          }
      ).once.returns(
          Aws::S3::Types::DeleteObjectsOutput.new(
              errors: []
          )
      )

      cleaned = AWSNamespaceCleaner.new(owner_id: user.id, readonly: false).clean
      p "cleaned: #{cleaned}"
      pkg_files.each do |file|
        assert_equal true, Registry::File.where(guid: file.guid).first.deleted
      end
      assert_equal true, cleaned
    end

    test "S3 delete is not invoked in readonly mode and file status is not updated" do
      user = create :user, login: "test-user", password: GitHub.default_password
      GitHub.flipper[:packages_docker_v1_migrated].enable(user)
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.save!

      file = docker_pkg.package_files.first
      key = "#{repo.id}/#{file.guid}"

      delete_marker_ids = [
          "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
      ]
      version_ids = %w[
          etwQFlGfNwJzTqn2or47IvfX6e8bqMxC
          CSayBA3DDwdIpXoZcZACoDFZUE3sb6LG
      ]
      delete_markers = delete_marker_ids.map { |id| { key: key, version_id: id } }
      versions = version_ids.map { |id| { key: key, version_id: id } }

      s3 = Aws::S3::Client.new(stub_responses: true)
      AWSNamespaceCleanerClient.stubs(:s3_production_data_cleaner_client).returns(s3)
      s3.expects(:list_object_versions).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          prefix: key
      ).once.returns(
          Aws::S3::Types::ListObjectVersionsOutput.new(
              delete_markers: delete_markers.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
              versions: versions.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
              is_truncated: false
          )
      )

      cleaned = AWSNamespaceCleaner.new(owner_id: user.id, readonly: true).clean
      assert_equal false, Registry::File.where(guid: file.guid).first.deleted
      assert_equal false, cleaned
    end

    test "S3 delete is invoked for all versions of a file and status is updated" do
      user = create :user, login: "test-user", password: GitHub.default_password
      GitHub.flipper[:packages_docker_v1_migrated].enable(user)
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.save!

      file = docker_pkg.package_files.first
      key = "#{repo.id}/#{file.guid}"

      delete_marker_ids = [
          "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
      ]
      version_ids = %w[
          etwQFlGfNwJzTqn2or47IvfX6e8bqMxC
          CSayBA3DDwdIpXoZcZACoDFZUE3sb6LG
      ]
      delete_markers = delete_marker_ids.map { |id| { key: key, version_id: id } }
      versions = version_ids.map { |id| { key: key, version_id: id } }
      objects = delete_markers + versions

      s3 = Aws::S3::Client.new(stub_responses: true)
      AWSNamespaceCleanerClient.stubs(:s3_production_data_cleaner_client).returns(s3)
      s3.expects(:list_object_versions).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          prefix: key
      ).once.returns(
          Aws::S3::Types::ListObjectVersionsOutput.new(
              delete_markers: delete_markers.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
              versions: versions.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
              is_truncated: false
          )
      )

      s3.expects(:delete_objects).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          delete: {
              objects: objects,
              quiet: true
          }
      ).once.returns(
          Aws::S3::Types::DeleteObjectsOutput.new(
              errors: []
          )
      )

      cleaned = AWSNamespaceCleaner.new(owner_id: user.id, readonly: false).clean
      assert_equal true, Registry::File.where(guid: file.guid).first.deleted
      assert_equal true, cleaned
    end

    test "S3 delete is invoked for all files of a version and status is updated" do
      user = create :user, login: "test-user", password: GitHub.default_password
      GitHub.flipper[:packages_docker_v1_migrated].enable(user)
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file1", size: 1)
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file2", size: 1)
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file3", size: 1)
      docker_pkg_v1.save!
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.save!

      s3 = Aws::S3::Client.new(stub_responses: true)
      AWSNamespaceCleanerClient.stubs(:s3_production_data_cleaner_client).returns(s3)
      objects = []
      docker_pkg.package_files.each do |file|
        key = "#{repo.id}/#{file.guid}"

        delete_marker_ids = [
            "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
        ]
        version_ids = %w[
            etwQFlGfNwJzTqn2or47IvfX6e8bqMxC
            CSayBA3DDwdIpXoZcZACoDFZUE3sb6LG
        ]
        delete_markers = delete_marker_ids.map { |id| { key: key, version_id: id } }
        versions = version_ids.map { |id| { key: key, version_id: id } }
        objects += delete_markers + versions

        s3.expects(:list_object_versions).with(
            bucket: AWSNamespaceCleaner::BUCKET,
            prefix: key
        ).once.returns(
            Aws::S3::Types::ListObjectVersionsOutput.new(
                delete_markers: delete_markers.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
                versions: versions.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
                is_truncated: false
            )
        )
      end

      s3.expects(:delete_objects).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          delete: {
              objects: objects,
              quiet: true
          }
      ).once.returns(
          Aws::S3::Types::DeleteObjectsOutput.new(
              errors: []
          )
      )

      cleaned = AWSNamespaceCleaner.new(owner_id: user.id, readonly: false, db_update_batch_size: 2).clean
      docker_pkg.package_files.each do |file|
        assert_equal true, Registry::File.where(guid: file.guid).first.deleted
      end
      assert_equal true, cleaned
    end


    test "S3 delete is invoked for all files of all versions and status is updated" do
      user = create :user, login: "test-user", password: GitHub.default_password
      GitHub.flipper[:packages_docker_v1_migrated].enable(user)
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg_v2 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.2")
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file1", size: 1)
      docker_pkg_v2.files << Registry::File.new(filename: "docker-file2", size: 1)
      docker_pkg_v1.save!
      docker_pkg_v2.save!
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.package_versions << docker_pkg_v2
      docker_pkg.save!

      s3 = Aws::S3::Client.new(stub_responses: true)
      AWSNamespaceCleanerClient.stubs(:s3_production_data_cleaner_client).returns(s3)
      objects = []
      docker_pkg.package_files.each do |file|
        key = "#{repo.id}/#{file.guid}"

        delete_marker_ids = [
            "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
        ]
        version_ids = %w[
            etwQFlGfNwJzTqn2or47IvfX6e8bqMxC
            CSayBA3DDwdIpXoZcZACoDFZUE3sb6LG
        ]
        delete_markers = delete_marker_ids.map { |id| { key: key, version_id: id } }
        versions = version_ids.map { |id| { key: key, version_id: id } }
        objects += delete_markers + versions

        s3.expects(:list_object_versions).with(
            bucket: AWSNamespaceCleaner::BUCKET,
            prefix: key
        ).once.returns(
            Aws::S3::Types::ListObjectVersionsOutput.new(
                delete_markers: delete_markers.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
                versions: versions.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
                is_truncated: false
            )
        )
      end

      s3.expects(:delete_objects).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          delete: {
              objects: objects,
              quiet: true
          }
      ).once.returns(
          Aws::S3::Types::DeleteObjectsOutput.new(
              errors: []
          )
      )

      cleaned = AWSNamespaceCleaner.new(owner_id: user.id, readonly: false).clean
      docker_pkg.package_files.each do |file|
        assert_equal true, Registry::File.where(guid: file.guid).first.deleted
      end
      assert_equal true, cleaned
    end

    test "S3 delete is invoked for all files of all packages and status is updated" do
      user = create :user, login: "test-user", password: GitHub.default_password
      GitHub.flipper[:packages_docker_v1_migrated].enable(user)
      repo1 = create :repository, owner: user
      example_repo :repository_test_simple, repo1
      repo2 = create :repository, owner: user
      example_repo :repository_test_simple, repo2

      docker_pkg1 = Registry::Package.new(
          name: "test-pkg-1",
          repository: repo1,
          owner: repo1.owner,
          package_type: :docker
      )
      docker_pkg1_v1 = make_registry_package_version(registry_package: docker_pkg1, tag_name: "0.0.1")
      docker_pkg1_v2 = make_registry_package_version(registry_package: docker_pkg1, tag_name: "0.0.2")
      docker_pkg1.package_versions << docker_pkg1_v1
      docker_pkg1.package_versions << docker_pkg1_v2
      docker_pkg1.save

      docker_pkg2 = Registry::Package.new(
          name: "test-pkg-2",
          repository: repo2,
          owner: repo2.owner,
          package_type: :docker
      )
      docker_pkg2_v1 = make_registry_package_version(registry_package: docker_pkg2, tag_name: "0.0.1")
      docker_pkg2_v2 = make_registry_package_version(registry_package: docker_pkg2, tag_name: "0.0.2")
      docker_pkg2.package_versions << docker_pkg2_v1
      docker_pkg2.package_versions << docker_pkg2_v2
      docker_pkg2.save

      s3 = Aws::S3::Client.new(stub_responses: true)
      AWSNamespaceCleanerClient.stubs(:s3_production_data_cleaner_client).returns(s3)
      objects = []
      pkg_files = docker_pkg1.package_files + docker_pkg2.package_files
      docker_pkg1.package_files.each do |file|
        key = "#{repo1.id}/#{file.guid}"

        delete_marker_ids = [
            "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
        ]
        version_ids = %w[
            etwQFlGfNwJzTqn2or47IvfX6e8bqMxC
            CSayBA3DDwdIpXoZcZACoDFZUE3sb6LG
        ]
        delete_markers = delete_marker_ids.map { |id| { key: key, version_id: id } }
        versions = version_ids.map { |id| { key: key, version_id: id } }
        objects += delete_markers + versions

        s3.expects(:list_object_versions).with(
            bucket: AWSNamespaceCleaner::BUCKET,
            prefix: key
        ).once.returns(
            Aws::S3::Types::ListObjectVersionsOutput.new(
                delete_markers: delete_markers.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
                versions: versions.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
                is_truncated: false
            )
        )
      end
      docker_pkg2.package_files.each do |file|
        key = "#{repo2.id}/#{file.guid}"

        delete_marker_ids = [
            "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
        ]
        version_ids = %w[
            etwQFlGfNwJzTqn2or47IvfX6e8bqMxC
            CSayBA3DDwdIpXoZcZACoDFZUE3sb6LG
        ]
        delete_markers = delete_marker_ids.map { |id| { key: key, version_id: id } }
        versions = version_ids.map { |id| { key: key, version_id: id } }
        objects += delete_markers + versions

        s3.expects(:list_object_versions).with(
            bucket: AWSNamespaceCleaner::BUCKET,
            prefix: key
        ).once.returns(
            Aws::S3::Types::ListObjectVersionsOutput.new(
                delete_markers: delete_markers.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
                versions: versions.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
                is_truncated: false
            )
        )
      end

      s3.expects(:delete_objects).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          delete: {
              objects: objects,
              quiet: true
          }
      ).once.returns(
          Aws::S3::Types::DeleteObjectsOutput.new(
              errors: []
          )
      )

      cleaned = AWSNamespaceCleaner.new(owner_id: user.id, readonly: false).clean
      pkg_files.each do |file|
        assert_equal true, Registry::File.where(guid: file.guid).first.deleted
      end
      assert_equal true, cleaned
    end

    test "S3 delete is invoked for all files of only docker packages and status is updated" do
      user = create :user, login: "test-user", password: GitHub.default_password
      GitHub.flipper[:packages_docker_v1_migrated].enable(user)
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg_v2 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.2")
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.package_versions << docker_pkg_v2
      docker_pkg.save

      npm_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :npm
      )
      npm_pkg_v1 = make_registry_package_version(registry_package: npm_pkg, tag_name: "0.0.3")
      npm_pkg_v2 = make_registry_package_version(registry_package: npm_pkg, tag_name: "0.0.4")
      npm_pkg.package_versions << npm_pkg_v1
      npm_pkg.package_versions << npm_pkg_v2
      npm_pkg.save

      s3 = Aws::S3::Client.new(stub_responses: true)
      AWSNamespaceCleanerClient.stubs(:s3_production_data_cleaner_client).returns(s3)
      objects = []
      docker_pkg.package_files.each do |file|
        key = "#{repo.id}/#{file.guid}"

        delete_marker_ids = [
            "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
        ]
        version_ids = %w[
            etwQFlGfNwJzTqn2or47IvfX6e8bqMxC
            CSayBA3DDwdIpXoZcZACoDFZUE3sb6LG
        ]
        delete_markers = delete_marker_ids.map { |id| { key: key, version_id: id } }
        versions = version_ids.map { |id| { key: key, version_id: id } }
        objects += delete_markers + versions

        s3.expects(:list_object_versions).with(
            bucket: AWSNamespaceCleaner::BUCKET,
            prefix: key
        ).once.returns(
            Aws::S3::Types::ListObjectVersionsOutput.new(
                delete_markers: delete_markers.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
                versions: versions.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
                is_truncated: false
            )
        )
      end

      s3.expects(:delete_objects).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          delete: {
              objects: objects,
              quiet: true
          }
      ).once.returns(
          Aws::S3::Types::DeleteObjectsOutput.new(
              errors: []
          )
      )

      cleaned = AWSNamespaceCleaner.new(owner_id: user.id, readonly: false).clean
      docker_pkg.package_files.each do |file|
        assert_equal true, Registry::File.where(guid: file.guid).first.deleted
      end
      npm_pkg.package_files.each do |file|
        assert_equal false, Registry::File.where(guid: file.guid).first.deleted
      end
      assert_equal true, cleaned
    end



    test "file status remains unchanged for S3 delete request error" do
      user = create :user, login: "test-user", password: GitHub.default_password
      GitHub.flipper[:packages_docker_v1_migrated].enable(user)
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.save!

      file = docker_pkg.package_files.first
      key = "#{repo.id}/#{file.guid}"

      delete_marker_ids = [
          "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
      ]
      version_ids = %w[
          etwQFlGfNwJzTqn2or47IvfX6e8bqMxC
          CSayBA3DDwdIpXoZcZACoDFZUE3sb6LG
      ]
      delete_markers = delete_marker_ids.map { |id| { key: key, version_id: id } }
      versions = version_ids.map { |id| { key: key, version_id: id } }
      objects = delete_markers + versions

      s3 = Aws::S3::Client.new(stub_responses: true)
      AWSNamespaceCleanerClient.stubs(:s3_production_data_cleaner_client).returns(s3)
      s3.expects(:list_object_versions).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          prefix: key
      ).once.returns(
          Aws::S3::Types::ListObjectVersionsOutput.new(
              delete_markers: delete_markers.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
              versions: versions.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
              is_truncated: false
          )
      )

      s3.expects(:delete_objects).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          delete: {
              objects: objects,
              quiet: true
          }
      ).once.returns(
          Aws::S3::Types::DeleteObjectsOutput.new(
              errors: [
                  Aws::S3::Types::Error.new({
                      key: key
                  })
              ]
          )
      )

      cleaned = AWSNamespaceCleaner.new(owner_id: user.id, readonly: false).clean
      assert_equal false, Registry::File.where(guid: file.guid).first.deleted
      assert_equal false, cleaned
    end

    test "delete error in one file should not affect status of other files" do
      user = create :user, login: "test-user", password: GitHub.default_password
      GitHub.flipper[:packages_docker_v1_migrated].enable(user)
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file1", size: 1)
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file2", size: 1)
      docker_pkg_v1.save!
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.save!

      s3 = Aws::S3::Client.new(stub_responses: true)
      AWSNamespaceCleanerClient.stubs(:s3_production_data_cleaner_client).returns(s3)
      objects = []
      docker_pkg.package_files.each do |file|
        key = "#{repo.id}/#{file.guid}"

        delete_marker_ids = [
            "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
        ]
        version_ids = %w[
            etwQFlGfNwJzTqn2or47IvfX6e8bqMxC
            CSayBA3DDwdIpXoZcZACoDFZUE3sb6LG
        ]
        delete_markers = delete_marker_ids.map { |id| { key: key, version_id: id } }
        versions = version_ids.map { |id| { key: key, version_id: id } }
        objects += delete_markers + versions

        s3.expects(:list_object_versions).with(
            bucket: AWSNamespaceCleaner::BUCKET,
            prefix: key
        ).once.returns(
            Aws::S3::Types::ListObjectVersionsOutput.new(
                delete_markers: delete_markers.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
                versions: versions.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
                is_truncated: false
            )
        )
      end

      s3.expects(:delete_objects).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          delete: {
              objects: objects,
              quiet: true
          }
      ).once.returns(
          Aws::S3::Types::DeleteObjectsOutput.new(
              errors: [
                  Aws::S3::Types::Error.new({
                      key: "#{repo.id}/#{docker_pkg.package_files.first.guid}"
                  })
              ]
          )
      )

      cleaned = AWSNamespaceCleaner.new(owner_id: user.id, readonly: false).clean
      package_files = docker_pkg.package_files
      error_file = package_files.first
      other_files = package_files[1...]
      other_files.each do |file|
        assert_equal true, Registry::File.where(guid: file.guid).first.deleted
      end
      assert_equal false, Registry::File.where(guid: error_file.guid).first.deleted
      assert_equal false, cleaned
    end

  end

  context "s3 batch testing" do
    test "cover all versions of all files in one batch" do
      user = create :user, login: "test-user", password: GitHub.default_password
      GitHub.flipper[:packages_docker_v1_migrated].enable(user)
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file1", size: 1)
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file2", size: 1)
      docker_pkg_v1.save!
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.save!

      s3 = Aws::S3::Client.new(stub_responses: true)
      AWSNamespaceCleanerClient.stubs(:s3_production_data_cleaner_client).returns(s3)
      objects = []
      docker_pkg.package_files.each do |file|
        key = "#{repo.id}/#{file.guid}"

        delete_marker_ids = [
            "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
        ]
        version_ids = %w[
            etwQFlGfNwJzTqn2or47IvfX6e8bqMxC
            CSayBA3DDwdIpXoZcZACoDFZUE3sb6LG
        ]
        delete_markers = delete_marker_ids.map { |id| { key: key, version_id: id } }
        versions = version_ids.map { |id| { key: key, version_id: id } }
        objects += delete_markers + versions

        s3.expects(:list_object_versions).with(
            bucket: AWSNamespaceCleaner::BUCKET,
            prefix: key
        ).once.returns(
            Aws::S3::Types::ListObjectVersionsOutput.new(
                delete_markers: delete_markers.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
                versions: versions.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
                is_truncated: false
            )
        )
      end

      s3.expects(:delete_objects).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          delete: {
              objects: objects,
              quiet: true
          }
      ).once.returns(
          Aws::S3::Types::DeleteObjectsOutput.new(
              errors: []
          )
      )

      cleaned = AWSNamespaceCleaner.new(owner_id: user.id, readonly: false).clean
      docker_pkg.package_files.each do |file|
        assert_equal true, Registry::File.where(guid: file.guid).first.deleted
      end
      assert_equal true, cleaned
    end

    test "when number of file versions is relatively more than batch size" do
      user = create :user, login: "test-user", password: GitHub.default_password
      GitHub.flipper[:packages_docker_v1_migrated].enable(user)
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.save!

      s3 = Aws::S3::Client.new(stub_responses: true)
      AWSNamespaceCleanerClient.stubs(:s3_production_data_cleaner_client).returns(s3)
      objects = []
      docker_pkg.package_files.each do |file|
        key = "#{repo.id}/#{file.guid}"

        delete_marker_ids = [
            "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
        ]
        version_ids = %w[
            etwQFlGfNwJzTqn2or47IvfX6e8bqMxC
            CSayBA3DDwdIpXoZcZACoDFZUE3sb6LG
        ]
        delete_markers = delete_marker_ids.map { |id| { key: key, version_id: id } }
        versions = version_ids.map { |id| { key: key, version_id: id } }
        objects += delete_markers + versions

        s3.expects(:list_object_versions).with(
            bucket: AWSNamespaceCleaner::BUCKET,
            prefix: key
        ).once.returns(
            Aws::S3::Types::ListObjectVersionsOutput.new(
                delete_markers: delete_markers.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
                versions: versions.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
                is_truncated: false
            )
        )
      end

      s3.expects(:delete_objects).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          delete: {
              objects: objects[...2],
              quiet: true
          }
      ).once.returns(
          Aws::S3::Types::DeleteObjectsOutput.new(
              errors: []
          )
      )
      s3.expects(:delete_objects).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          delete: {
              objects: objects[2...],
              quiet: true
          }
      ).once.returns(
          Aws::S3::Types::DeleteObjectsOutput.new(
              errors: []
          )
      )

      cleaned = AWSNamespaceCleaner.new(owner_id: user.id, readonly: false, batch_size: 2).clean
      docker_pkg.package_files.each do |file|
        assert_equal true, Registry::File.where(guid: file.guid).first.deleted
      end
      assert_equal true, cleaned
    end

    test "when number of file versions is much more than batch size" do
      user = create :user, login: "test-user", password: GitHub.default_password
      GitHub.flipper[:packages_docker_v1_migrated].enable(user)
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.save!

      s3 = Aws::S3::Client.new(stub_responses: true)
      AWSNamespaceCleanerClient.stubs(:s3_production_data_cleaner_client).returns(s3)
      objects = []
      docker_pkg.package_files.each do |file|
        key = "#{repo.id}/#{file.guid}"

        delete_marker_ids = [
            "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
        ]
        version_ids = [
            "etwQFlGfNwJzTqn2or47IvfX6e8bqMxC",
            "CSayBA3DDwdIpXoZcZACoDFZUE3sb6LG",
            "oIHb8suDYlQp3JtWpFDNU.njCelZ8t9x",
            "0XtfxrSyPIbYVzRt.FAMRGCMaRwofNkG",
            "5PJRGOVJfBLZXFwzYNeq8u98vZqkMpl0",
            "YgD9Zq6MdYNaVm.dL8Z7qp_0Khjoad1g",
            "oc.EeFnmVIRshTlCpFsoTwpIUKCZq31d",
            "SKcZ96W7e50_H2htvxVGsPHz_KuPbSui",
            "0TYnin7h_9_dCF9k_uOJqIFIly.D8k5C"
        ]
        delete_markers = delete_marker_ids.map { |id| { key: key, version_id: id } }
        versions = version_ids.map { |id| { key: key, version_id: id } }
        objects += delete_markers + versions

        s3.expects(:list_object_versions).with(
            bucket: AWSNamespaceCleaner::BUCKET,
            prefix: key
        ).once.returns(
            Aws::S3::Types::ListObjectVersionsOutput.new(
                delete_markers: delete_markers.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
                versions: versions.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
                is_truncated: false
            )
        )
      end

      batch_size = 2
      idx = 0
      while idx < objects.length
        s3.expects(:delete_objects).with(
            bucket: AWSNamespaceCleaner::BUCKET,
            delete: {
                objects: objects[idx...idx + batch_size],
                quiet: true
            }
        ).once.returns(
            Aws::S3::Types::DeleteObjectsOutput.new(
                errors: []
            )
        )
        idx = idx + batch_size
      end

      cleaned = AWSNamespaceCleaner.new(owner_id: user.id, readonly: false, batch_size: batch_size).clean
      docker_pkg.package_files.each do |file|
        assert_equal true, Registry::File.where(guid: file.guid).first.deleted
      end
      assert_equal true, cleaned
    end

    test "split file versions with other files in batch" do
      user = create :user, login: "test-user", password: GitHub.default_password
      GitHub.flipper[:packages_docker_v1_migrated].enable(user)
      repo = create :repository, owner: user
      example_repo :repository_test_simple, repo
      docker_pkg = Registry::Package.new(
          name: "test-pkg",
          repository: repo,
          owner: repo.owner,
          package_type: :docker
      )
      docker_pkg_v1 = make_registry_package_version(registry_package: docker_pkg, tag_name: "0.0.1")
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file1", size: 1)
      docker_pkg_v1.files << Registry::File.new(filename: "docker-file2", size: 1)
      docker_pkg_v1.save!
      docker_pkg.package_versions << docker_pkg_v1
      docker_pkg.save!

      s3 = Aws::S3::Client.new(stub_responses: true)
      AWSNamespaceCleanerClient.stubs(:s3_production_data_cleaner_client).returns(s3)
      pkg_files = docker_pkg.package_files
      dm1 = [
          "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
      ].map { |id| { key: "#{repo.id}/#{pkg_files[0].guid}", version_id: id } }
      v1 = %w[
          etwQFlGfNwJzTqn2or47IvfX6e8bqMxC
          CSayBA3DDwdIpXoZcZACoDFZUE3sb6LG
      ].map { |id| { key: "#{repo.id}/#{pkg_files[0].guid}", version_id: id } }
      dm2 = [
          "oc.EeFnmVIRshTlCpFsoTwpIUKCZq31d"
      ].map { |id| { key: "#{repo.id}/#{pkg_files[1].guid}", version_id: id } }
      v2 = [
          "oIHb8suDYlQp3JtWpFDNU.njCelZ8t9x",
          "0XtfxrSyPIbYVzRt.FAMRGCMaRwofNkG",
          "5PJRGOVJfBLZXFwzYNeq8u98vZqkMpl0"
      ].map { |id| { key: "#{repo.id}/#{pkg_files[1].guid}", version_id: id } }
      dm3 = [
          "Bm7X0NjMOhi8zEU3dyGqqKusU66nzzF8"
      ].map { |id| { key: "#{repo.id}/#{pkg_files[2].guid}", version_id: id } }
      v3 = [
          "SKcZ96W7e50_H2htvxVGsPHz_KuPbSui",
          "0TYnin7h_9_dCF9k_uOJqIFIly.D8k5C"
      ].map { |id| { key: "#{repo.id}/#{pkg_files[2].guid}", version_id: id } }

      s3.expects(:list_object_versions).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          prefix: "#{repo.id}/#{pkg_files[0].guid}"
      ).once.returns(
          Aws::S3::Types::ListObjectVersionsOutput.new(
              delete_markers: dm1.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
              versions: v1.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
              is_truncated: false
          )
      )
      s3.expects(:list_object_versions).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          prefix: "#{repo.id}/#{pkg_files[1].guid}"
      ).once.returns(
          Aws::S3::Types::ListObjectVersionsOutput.new(
              delete_markers: dm2.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
              versions: v2.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
              is_truncated: false
          )
      )
      s3.expects(:list_object_versions).with(
          bucket: AWSNamespaceCleaner::BUCKET,
          prefix: "#{repo.id}/#{pkg_files[2].guid}"
      ).once.returns(
          Aws::S3::Types::ListObjectVersionsOutput.new(
              delete_markers: dm3.map { |dm| Aws::S3::Types::DeleteMarkerEntry.new(dm) },
              versions: v3.map { |v| Aws::S3::Types::ObjectVersion.new(v) },
              is_truncated: false
          )
      )

      objects = dm1 + v1 + dm2 + v2 + dm3 + v3
      batch_size = 4
      idx = 0
      while idx < objects.length
        s3.expects(:delete_objects).with(
            bucket: AWSNamespaceCleaner::BUCKET,
            delete: {
                objects: objects[idx...idx + batch_size],
                quiet: true
            }
        ).once.returns(
            Aws::S3::Types::DeleteObjectsOutput.new(
                errors: []
            )
        )
        idx = idx + batch_size
      end

      cleaned = AWSNamespaceCleaner.new(owner_id: user.id, readonly: false, batch_size: batch_size).clean
      docker_pkg.package_files.each do |file|
        assert_equal true, Registry::File.where(guid: file.guid).first.deleted
      end
      assert_equal true, cleaned
    end

  end

end
