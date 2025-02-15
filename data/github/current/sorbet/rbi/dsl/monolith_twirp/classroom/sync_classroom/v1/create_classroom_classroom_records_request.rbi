# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Classroom::SyncClassroom::V1::CreateClassroomClassroomRecordsRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Classroom::SyncClassroom::V1::CreateClassroomClassroomRecordsRequest`.

class MonolithTwirp::Classroom::SyncClassroom::V1::CreateClassroomClassroomRecordsRequest
  sig { params(classroom_name: T.nilable(String), id: T.nilable(Integer)).void }
  def initialize(classroom_name: nil, id: nil); end

  sig { returns(String) }
  def classroom_name; end

  sig { params(value: String).void }
  def classroom_name=(value); end

  sig { void }
  def clear_classroom_name; end

  sig { void }
  def clear_id; end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end
end
