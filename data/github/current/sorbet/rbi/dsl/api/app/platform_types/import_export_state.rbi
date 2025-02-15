# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::ImportExportState`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::ImportExportState`.

module Api::App::PlatformTypes::ImportExportState
  sig { returns(T::Boolean) }
  def archive_uploaded?; end

  sig { returns(T::Boolean) }
  def conflicts?; end

  sig { returns(T::Boolean) }
  def exported?; end

  sig { returns(T::Boolean) }
  def exporting?; end

  sig { returns(T::Boolean) }
  def failed?; end

  sig { returns(T::Boolean) }
  def failed_import?; end

  sig { returns(T::Boolean) }
  def imported?; end

  sig { returns(T::Boolean) }
  def importing?; end

  sig { returns(T::Boolean) }
  def mapping?; end

  sig { returns(T::Boolean) }
  def pending?; end

  sig { returns(T::Boolean) }
  def preparing?; end

  sig { returns(T::Boolean) }
  def ready?; end

  sig { returns(T::Boolean) }
  def unlocked?; end

  sig { returns(T::Boolean) }
  def waiting?; end

  ARCHIVE_UPLOADED = T.let("ARCHIVE_UPLOADED", String)
  CONFLICTS = T.let("CONFLICTS", String)
  EXPORTED = T.let("EXPORTED", String)
  EXPORTING = T.let("EXPORTING", String)
  FAILED = T.let("FAILED", String)
  FAILED_IMPORT = T.let("FAILED_IMPORT", String)
  IMPORTED = T.let("IMPORTED", String)
  IMPORTING = T.let("IMPORTING", String)
  MAPPING = T.let("MAPPING", String)
  PENDING = T.let("PENDING", String)
  PREPARING = T.let("PREPARING", String)
  READY = T.let("READY", String)
  UNLOCKED = T.let("UNLOCKED", String)
  WAITING = T.let("WAITING", String)
end
