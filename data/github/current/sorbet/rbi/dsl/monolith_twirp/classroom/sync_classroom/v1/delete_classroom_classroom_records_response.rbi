# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Classroom::SyncClassroom::V1::DeleteClassroomClassroomRecordsResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Classroom::SyncClassroom::V1::DeleteClassroomClassroomRecordsResponse`.

class MonolithTwirp::Classroom::SyncClassroom::V1::DeleteClassroomClassroomRecordsResponse
  sig { params(deleted: T.nilable(T::Boolean)).void }
  def initialize(deleted: nil); end

  sig { void }
  def clear_deleted; end

  sig { returns(T::Boolean) }
  def deleted; end

  sig { params(value: T::Boolean).void }
  def deleted=(value); end
end
