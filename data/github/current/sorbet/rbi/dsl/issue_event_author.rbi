# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `IssueEventAuthor`.
# Please instead update this file by running `bin/tapioca dsl IssueEventAuthor`.

class IssueEventAuthor
  include GeneratedAsyncReflectionAssociations
  include GeneratedSpammableMethods
  extend GeneratedSpammableClassMethods
  include GeneratedAssociationMethods
  include GeneratedAttributeMethods
  extend CommonRelationMethods
  extend GeneratedRelationMethods

  private

  sig { returns(NilClass) }
  def to_ary; end

  module CommonRelationMethods
    sig { params(block: T.nilable(T.proc.params(record: ::IssueEventAuthor).returns(T.untyped))).returns(T::Boolean) }
    def any?(&block); end

    sig { params(column_name: T.any(String, Symbol)).returns(T.untyped) }
    def average(column_name); end

    sig do
      params(
        attributes: T.untyped,
        block: T.nilable(T.proc.params(object: ::IssueEventAuthor).void)
      ).returns(::IssueEventAuthor)
    end
    def build(attributes = nil, &block); end

    sig { params(operation: Symbol, column_name: T.any(String, Symbol)).returns(T.untyped) }
    def calculate(operation, column_name); end

    sig { params(column_name: T.untyped).returns(T.untyped) }
    def count(column_name = nil); end

    sig do
      params(
        attributes: T.untyped,
        block: T.nilable(T.proc.params(object: ::IssueEventAuthor).void)
      ).returns(::IssueEventAuthor)
    end
    def create(attributes = nil, &block); end

    sig do
      params(
        attributes: T.untyped,
        block: T.nilable(T.proc.params(object: ::IssueEventAuthor).void)
      ).returns(::IssueEventAuthor)
    end
    def create!(attributes = nil, &block); end

    sig do
      params(
        attributes: T.untyped,
        block: T.nilable(T.proc.params(object: ::IssueEventAuthor).void)
      ).returns(::IssueEventAuthor)
    end
    def create_or_find_by(attributes, &block); end

    sig do
      params(
        attributes: T.untyped,
        block: T.nilable(T.proc.params(object: ::IssueEventAuthor).void)
      ).returns(::IssueEventAuthor)
    end
    def create_or_find_by!(attributes, &block); end

    sig { returns(T::Array[::IssueEventAuthor]) }
    def destroy_all; end

    sig { params(conditions: T.untyped).returns(T::Boolean) }
    def exists?(conditions = :none); end

    sig { returns(T.nilable(::IssueEventAuthor)) }
    def fifth; end

    sig { returns(::IssueEventAuthor) }
    def fifth!; end

    sig { params(args: T.untyped).returns(T.untyped) }
    def find(*args); end

    sig { params(args: T.untyped).returns(T.nilable(::IssueEventAuthor)) }
    def find_by(*args); end

    sig { params(args: T.untyped).returns(::IssueEventAuthor) }
    def find_by!(*args); end

    sig do
      params(
        start: T.untyped,
        finish: T.untyped,
        batch_size: Integer,
        error_on_ignore: T.untyped,
        order: Symbol,
        block: T.nilable(T.proc.params(object: ::IssueEventAuthor).void)
      ).returns(T.nilable(T::Enumerator[::IssueEventAuthor]))
    end
    def find_each(start: nil, finish: nil, batch_size: 1000, error_on_ignore: nil, order: :asc, &block); end

    sig do
      params(
        start: T.untyped,
        finish: T.untyped,
        batch_size: Integer,
        error_on_ignore: T.untyped,
        order: Symbol,
        block: T.nilable(T.proc.params(object: T::Array[::IssueEventAuthor]).void)
      ).returns(T.nilable(T::Enumerator[T::Enumerator[::IssueEventAuthor]]))
    end
    def find_in_batches(start: nil, finish: nil, batch_size: 1000, error_on_ignore: nil, order: :asc, &block); end

    sig do
      params(
        attributes: T.untyped,
        block: T.nilable(T.proc.params(object: ::IssueEventAuthor).void)
      ).returns(::IssueEventAuthor)
    end
    def find_or_create_by(attributes, &block); end

    sig do
      params(
        attributes: T.untyped,
        block: T.nilable(T.proc.params(object: ::IssueEventAuthor).void)
      ).returns(::IssueEventAuthor)
    end
    def find_or_create_by!(attributes, &block); end

    sig do
      params(
        attributes: T.untyped,
        block: T.nilable(T.proc.params(object: ::IssueEventAuthor).void)
      ).returns(::IssueEventAuthor)
    end
    def find_or_initialize_by(attributes, &block); end

    sig { params(signed_id: T.untyped, purpose: T.untyped).returns(T.nilable(::IssueEventAuthor)) }
    def find_signed(signed_id, purpose: nil); end

    sig { params(signed_id: T.untyped, purpose: T.untyped).returns(::IssueEventAuthor) }
    def find_signed!(signed_id, purpose: nil); end

    sig { params(arg: T.untyped, args: T.untyped).returns(::IssueEventAuthor) }
    def find_sole_by(arg, *args); end

    sig { params(limit: T.untyped).returns(T.untyped) }
    def first(limit = nil); end

    sig { returns(::IssueEventAuthor) }
    def first!; end

    sig { returns(T.nilable(::IssueEventAuthor)) }
    def forty_two; end

    sig { returns(::IssueEventAuthor) }
    def forty_two!; end

    sig { returns(T.nilable(::IssueEventAuthor)) }
    def fourth; end

    sig { returns(::IssueEventAuthor) }
    def fourth!; end

    sig { returns(Array) }
    def ids; end

    sig do
      params(
        of: Integer,
        start: T.untyped,
        finish: T.untyped,
        load: T.untyped,
        error_on_ignore: T.untyped,
        order: Symbol,
        use_ranges: T.untyped,
        block: T.nilable(T.proc.params(object: PrivateRelation).void)
      ).returns(T.nilable(::ActiveRecord::Batches::BatchEnumerator))
    end
    def in_batches(of: 1000, start: nil, finish: nil, load: false, error_on_ignore: nil, order: :asc, use_ranges: nil, &block); end

    sig { params(record: T.untyped).returns(T::Boolean) }
    def include?(record); end

    sig { params(limit: T.untyped).returns(T.untyped) }
    def last(limit = nil); end

    sig { returns(::IssueEventAuthor) }
    def last!; end

    sig { params(block: T.nilable(T.proc.params(record: ::IssueEventAuthor).returns(T.untyped))).returns(T::Boolean) }
    def many?(&block); end

    sig { params(column_name: T.any(String, Symbol)).returns(T.untyped) }
    def maximum(column_name); end

    sig { params(record: T.untyped).returns(T::Boolean) }
    def member?(record); end

    sig { params(column_name: T.any(String, Symbol)).returns(T.untyped) }
    def minimum(column_name); end

    sig do
      params(
        attributes: T.untyped,
        block: T.nilable(T.proc.params(object: ::IssueEventAuthor).void)
      ).returns(::IssueEventAuthor)
    end
    def new(attributes = nil, &block); end

    sig { params(block: T.nilable(T.proc.params(record: ::IssueEventAuthor).returns(T.untyped))).returns(T::Boolean) }
    def none?(&block); end

    sig { params(block: T.nilable(T.proc.params(record: ::IssueEventAuthor).returns(T.untyped))).returns(T::Boolean) }
    def one?(&block); end

    sig { params(column_names: T.untyped).returns(T.untyped) }
    def pick(*column_names); end

    sig { params(column_names: T.untyped).returns(T.untyped) }
    def pluck(*column_names); end

    sig { returns(T.nilable(::IssueEventAuthor)) }
    def second; end

    sig { returns(::IssueEventAuthor) }
    def second!; end

    sig { returns(T.nilable(::IssueEventAuthor)) }
    def second_to_last; end

    sig { returns(::IssueEventAuthor) }
    def second_to_last!; end

    sig { returns(::IssueEventAuthor) }
    def sole; end

    sig do
      params(
        column_name: T.nilable(T.any(String, Symbol)),
        block: T.nilable(T.proc.params(record: T.untyped).returns(T.untyped))
      ).returns(T.untyped)
    end
    def sum(column_name = nil, &block); end

    sig { params(limit: T.untyped).returns(T.untyped) }
    def take(limit = nil); end

    sig { returns(::IssueEventAuthor) }
    def take!; end

    sig { returns(T.nilable(::IssueEventAuthor)) }
    def third; end

    sig { returns(::IssueEventAuthor) }
    def third!; end

    sig { returns(T.nilable(::IssueEventAuthor)) }
    def third_to_last; end

    sig { returns(::IssueEventAuthor) }
    def third_to_last!; end
  end

  module GeneratedAssociationMethods
    sig { returns(T.nilable(::User)) }
    def author; end

    sig { params(value: T.nilable(::User)).void }
    def author=(value); end

    sig { params(args: T.untyped, blk: T.untyped).returns(::User) }
    def build_author(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(::IssueEvent) }
    def build_issue_event(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(::User) }
    def create_author(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(::User) }
    def create_author!(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(::IssueEvent) }
    def create_issue_event(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(::IssueEvent) }
    def create_issue_event!(*args, &blk); end

    sig { returns(T.nilable(::IssueEvent)) }
    def issue_event; end

    sig { params(value: T.nilable(::IssueEvent)).void }
    def issue_event=(value); end

    sig { returns(T.nilable(::User)) }
    def reload_author; end

    sig { returns(T.nilable(::IssueEvent)) }
    def reload_issue_event; end
  end

  module GeneratedAssociationRelationMethods
    sig { returns(PrivateAssociationRelation) }
    def all; end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def and(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def annotate(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def create_with(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def distinct(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def eager_load(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def except(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def excluding(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def extending(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def extract_associated(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def filter_spam_for(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def from(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def group(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def having(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def in_order_of(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def includes(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def invert_where(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def joins(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def left_joins(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def left_outer_joins(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def limit(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def limit_execution_time(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def lock(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def merge(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def none(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def not_spammy(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def null_relation?(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def offset(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def only(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def optimizer_hints(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def or(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def order(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def preload(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def readonly(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def references(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def regroup(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def reorder(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def reselect(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def reverse_order(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def rewhere(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def select(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def spammy(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def strict_loading(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def structurally_compatible?(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def uniq!(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def unscope(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelationWhereChain) }
    def where(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def with(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def with_recursive(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def without(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateAssociationRelation) }
    def without_ids(*args, &blk); end
  end

  module GeneratedAsyncReflectionAssociations
    sig { returns(Promise[T.untyped]) }
    def async_author; end

    sig { returns(Promise[T.untyped]) }
    def async_issue_event; end
  end

  module GeneratedAttributeMethods
    sig { returns(::Integer) }
    def author_id; end

    sig { params(value: ::Integer).returns(::Integer) }
    def author_id=(value); end

    sig { returns(T::Boolean) }
    def author_id?; end

    sig { returns(T.nilable(::Integer)) }
    def author_id_before_last_save; end

    sig { returns(T.untyped) }
    def author_id_before_type_cast; end

    sig { returns(T::Boolean) }
    def author_id_came_from_user?; end

    sig { returns(T.nilable([::Integer, ::Integer])) }
    def author_id_change; end

    sig { returns(T.nilable([::Integer, ::Integer])) }
    def author_id_change_to_be_saved; end

    sig { params(from: ::Integer, to: ::Integer).returns(T::Boolean) }
    def author_id_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(::Integer)) }
    def author_id_in_database; end

    sig { returns(T.nilable([::Integer, ::Integer])) }
    def author_id_previous_change; end

    sig { params(from: ::Integer, to: ::Integer).returns(T::Boolean) }
    def author_id_previously_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(::Integer)) }
    def author_id_previously_was; end

    sig { returns(T.nilable(::Integer)) }
    def author_id_was; end

    sig { void }
    def author_id_will_change!; end

    sig { returns(T.nilable(::ActiveSupport::TimeWithZone)) }
    def created_at; end

    sig { params(value: ::ActiveSupport::TimeWithZone).returns(::ActiveSupport::TimeWithZone) }
    def created_at=(value); end

    sig { returns(T::Boolean) }
    def created_at?; end

    sig { returns(T.nilable(::ActiveSupport::TimeWithZone)) }
    def created_at_before_last_save; end

    sig { returns(T.untyped) }
    def created_at_before_type_cast; end

    sig { returns(T::Boolean) }
    def created_at_came_from_user?; end

    sig { returns(T.nilable([T.nilable(::ActiveSupport::TimeWithZone), T.nilable(::ActiveSupport::TimeWithZone)])) }
    def created_at_change; end

    sig { returns(T.nilable([T.nilable(::ActiveSupport::TimeWithZone), T.nilable(::ActiveSupport::TimeWithZone)])) }
    def created_at_change_to_be_saved; end

    sig { params(from: ::ActiveSupport::TimeWithZone, to: ::ActiveSupport::TimeWithZone).returns(T::Boolean) }
    def created_at_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(::ActiveSupport::TimeWithZone)) }
    def created_at_in_database; end

    sig { returns(T.nilable([T.nilable(::ActiveSupport::TimeWithZone), T.nilable(::ActiveSupport::TimeWithZone)])) }
    def created_at_previous_change; end

    sig { params(from: ::ActiveSupport::TimeWithZone, to: ::ActiveSupport::TimeWithZone).returns(T::Boolean) }
    def created_at_previously_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(::ActiveSupport::TimeWithZone)) }
    def created_at_previously_was; end

    sig { returns(T.nilable(::ActiveSupport::TimeWithZone)) }
    def created_at_was; end

    sig { void }
    def created_at_will_change!; end

    sig { returns(T.nilable(::Integer)) }
    def id; end

    sig { params(value: ::Integer).returns(::Integer) }
    def id=(value); end

    sig { returns(T::Boolean) }
    def id?; end

    sig { returns(T.nilable(::Integer)) }
    def id_before_last_save; end

    sig { returns(T.untyped) }
    def id_before_type_cast; end

    sig { returns(T::Boolean) }
    def id_came_from_user?; end

    sig { returns(T.nilable([T.nilable(::Integer), T.nilable(::Integer)])) }
    def id_change; end

    sig { returns(T.nilable([T.nilable(::Integer), T.nilable(::Integer)])) }
    def id_change_to_be_saved; end

    sig { params(from: ::Integer, to: ::Integer).returns(T::Boolean) }
    def id_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(::Integer)) }
    def id_in_database; end

    sig { returns(T.nilable([T.nilable(::Integer), T.nilable(::Integer)])) }
    def id_previous_change; end

    sig { params(from: ::Integer, to: ::Integer).returns(T::Boolean) }
    def id_previously_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(::Integer)) }
    def id_previously_was; end

    sig { returns(T.nilable(::Integer)) }
    def id_value; end

    sig { params(value: ::Integer).returns(::Integer) }
    def id_value=(value); end

    sig { returns(T::Boolean) }
    def id_value?; end

    sig { returns(T.nilable(::Integer)) }
    def id_value_before_last_save; end

    sig { returns(T.untyped) }
    def id_value_before_type_cast; end

    sig { returns(T::Boolean) }
    def id_value_came_from_user?; end

    sig { returns(T.nilable([T.nilable(::Integer), T.nilable(::Integer)])) }
    def id_value_change; end

    sig { returns(T.nilable([T.nilable(::Integer), T.nilable(::Integer)])) }
    def id_value_change_to_be_saved; end

    sig { params(from: ::Integer, to: ::Integer).returns(T::Boolean) }
    def id_value_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(::Integer)) }
    def id_value_in_database; end

    sig { returns(T.nilable([T.nilable(::Integer), T.nilable(::Integer)])) }
    def id_value_previous_change; end

    sig { params(from: ::Integer, to: ::Integer).returns(T::Boolean) }
    def id_value_previously_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(::Integer)) }
    def id_value_previously_was; end

    sig { returns(T.nilable(::Integer)) }
    def id_value_was; end

    sig { void }
    def id_value_will_change!; end

    sig { returns(T.nilable(::Integer)) }
    def id_was; end

    sig { void }
    def id_will_change!; end

    sig { returns(::Integer) }
    def issue_event_id; end

    sig { params(value: ::Integer).returns(::Integer) }
    def issue_event_id=(value); end

    sig { returns(T::Boolean) }
    def issue_event_id?; end

    sig { returns(T.nilable(::Integer)) }
    def issue_event_id_before_last_save; end

    sig { returns(T.untyped) }
    def issue_event_id_before_type_cast; end

    sig { returns(T::Boolean) }
    def issue_event_id_came_from_user?; end

    sig { returns(T.nilable([::Integer, ::Integer])) }
    def issue_event_id_change; end

    sig { returns(T.nilable([::Integer, ::Integer])) }
    def issue_event_id_change_to_be_saved; end

    sig { params(from: ::Integer, to: ::Integer).returns(T::Boolean) }
    def issue_event_id_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(::Integer)) }
    def issue_event_id_in_database; end

    sig { returns(T.nilable([::Integer, ::Integer])) }
    def issue_event_id_previous_change; end

    sig { params(from: ::Integer, to: ::Integer).returns(T::Boolean) }
    def issue_event_id_previously_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(::Integer)) }
    def issue_event_id_previously_was; end

    sig { returns(T.nilable(::Integer)) }
    def issue_event_id_was; end

    sig { void }
    def issue_event_id_will_change!; end

    sig { returns(::Integer) }
    def repository_id; end

    sig { params(value: ::Integer).returns(::Integer) }
    def repository_id=(value); end

    sig { returns(T::Boolean) }
    def repository_id?; end

    sig { returns(T.nilable(::Integer)) }
    def repository_id_before_last_save; end

    sig { returns(T.untyped) }
    def repository_id_before_type_cast; end

    sig { returns(T::Boolean) }
    def repository_id_came_from_user?; end

    sig { returns(T.nilable([::Integer, ::Integer])) }
    def repository_id_change; end

    sig { returns(T.nilable([::Integer, ::Integer])) }
    def repository_id_change_to_be_saved; end

    sig { params(from: ::Integer, to: ::Integer).returns(T::Boolean) }
    def repository_id_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(::Integer)) }
    def repository_id_in_database; end

    sig { returns(T.nilable([::Integer, ::Integer])) }
    def repository_id_previous_change; end

    sig { params(from: ::Integer, to: ::Integer).returns(T::Boolean) }
    def repository_id_previously_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(::Integer)) }
    def repository_id_previously_was; end

    sig { returns(T.nilable(::Integer)) }
    def repository_id_was; end

    sig { void }
    def repository_id_will_change!; end

    sig { void }
    def restore_author_id!; end

    sig { void }
    def restore_created_at!; end

    sig { void }
    def restore_id!; end

    sig { void }
    def restore_id_value!; end

    sig { void }
    def restore_issue_event_id!; end

    sig { void }
    def restore_repository_id!; end

    sig { void }
    def restore_updated_at!; end

    sig { void }
    def restore_user_hidden!; end

    sig { returns(T.nilable([::Integer, ::Integer])) }
    def saved_change_to_author_id; end

    sig { returns(T::Boolean) }
    def saved_change_to_author_id?; end

    sig { returns(T.nilable([T.nilable(::ActiveSupport::TimeWithZone), T.nilable(::ActiveSupport::TimeWithZone)])) }
    def saved_change_to_created_at; end

    sig { returns(T::Boolean) }
    def saved_change_to_created_at?; end

    sig { returns(T.nilable([T.nilable(::Integer), T.nilable(::Integer)])) }
    def saved_change_to_id; end

    sig { returns(T::Boolean) }
    def saved_change_to_id?; end

    sig { returns(T.nilable([T.nilable(::Integer), T.nilable(::Integer)])) }
    def saved_change_to_id_value; end

    sig { returns(T::Boolean) }
    def saved_change_to_id_value?; end

    sig { returns(T.nilable([::Integer, ::Integer])) }
    def saved_change_to_issue_event_id; end

    sig { returns(T::Boolean) }
    def saved_change_to_issue_event_id?; end

    sig { returns(T.nilable([::Integer, ::Integer])) }
    def saved_change_to_repository_id; end

    sig { returns(T::Boolean) }
    def saved_change_to_repository_id?; end

    sig { returns(T.nilable([T.nilable(::ActiveSupport::TimeWithZone), T.nilable(::ActiveSupport::TimeWithZone)])) }
    def saved_change_to_updated_at; end

    sig { returns(T::Boolean) }
    def saved_change_to_updated_at?; end

    sig { returns(T.nilable([T::Boolean, T::Boolean])) }
    def saved_change_to_user_hidden; end

    sig { returns(T::Boolean) }
    def saved_change_to_user_hidden?; end

    sig { returns(T.nilable(::ActiveSupport::TimeWithZone)) }
    def updated_at; end

    sig { params(value: ::ActiveSupport::TimeWithZone).returns(::ActiveSupport::TimeWithZone) }
    def updated_at=(value); end

    sig { returns(T::Boolean) }
    def updated_at?; end

    sig { returns(T.nilable(::ActiveSupport::TimeWithZone)) }
    def updated_at_before_last_save; end

    sig { returns(T.untyped) }
    def updated_at_before_type_cast; end

    sig { returns(T::Boolean) }
    def updated_at_came_from_user?; end

    sig { returns(T.nilable([T.nilable(::ActiveSupport::TimeWithZone), T.nilable(::ActiveSupport::TimeWithZone)])) }
    def updated_at_change; end

    sig { returns(T.nilable([T.nilable(::ActiveSupport::TimeWithZone), T.nilable(::ActiveSupport::TimeWithZone)])) }
    def updated_at_change_to_be_saved; end

    sig { params(from: ::ActiveSupport::TimeWithZone, to: ::ActiveSupport::TimeWithZone).returns(T::Boolean) }
    def updated_at_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(::ActiveSupport::TimeWithZone)) }
    def updated_at_in_database; end

    sig { returns(T.nilable([T.nilable(::ActiveSupport::TimeWithZone), T.nilable(::ActiveSupport::TimeWithZone)])) }
    def updated_at_previous_change; end

    sig { params(from: ::ActiveSupport::TimeWithZone, to: ::ActiveSupport::TimeWithZone).returns(T::Boolean) }
    def updated_at_previously_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(::ActiveSupport::TimeWithZone)) }
    def updated_at_previously_was; end

    sig { returns(T.nilable(::ActiveSupport::TimeWithZone)) }
    def updated_at_was; end

    sig { void }
    def updated_at_will_change!; end

    sig { returns(T::Boolean) }
    def user_hidden; end

    sig { params(value: T::Boolean).returns(T::Boolean) }
    def user_hidden=(value); end

    sig { returns(T::Boolean) }
    def user_hidden?; end

    sig { returns(T.nilable(T::Boolean)) }
    def user_hidden_before_last_save; end

    sig { returns(T.untyped) }
    def user_hidden_before_type_cast; end

    sig { returns(T::Boolean) }
    def user_hidden_came_from_user?; end

    sig { returns(T.nilable([T::Boolean, T::Boolean])) }
    def user_hidden_change; end

    sig { returns(T.nilable([T::Boolean, T::Boolean])) }
    def user_hidden_change_to_be_saved; end

    sig { params(from: T::Boolean, to: T::Boolean).returns(T::Boolean) }
    def user_hidden_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(T::Boolean)) }
    def user_hidden_in_database; end

    sig { returns(T.nilable([T::Boolean, T::Boolean])) }
    def user_hidden_previous_change; end

    sig { params(from: T::Boolean, to: T::Boolean).returns(T::Boolean) }
    def user_hidden_previously_changed?(from: T.unsafe(nil), to: T.unsafe(nil)); end

    sig { returns(T.nilable(T::Boolean)) }
    def user_hidden_previously_was; end

    sig { returns(T.nilable(T::Boolean)) }
    def user_hidden_was; end

    sig { void }
    def user_hidden_will_change!; end

    sig { returns(T::Boolean) }
    def will_save_change_to_author_id?; end

    sig { returns(T::Boolean) }
    def will_save_change_to_created_at?; end

    sig { returns(T::Boolean) }
    def will_save_change_to_id?; end

    sig { returns(T::Boolean) }
    def will_save_change_to_id_value?; end

    sig { returns(T::Boolean) }
    def will_save_change_to_issue_event_id?; end

    sig { returns(T::Boolean) }
    def will_save_change_to_repository_id?; end

    sig { returns(T::Boolean) }
    def will_save_change_to_updated_at?; end

    sig { returns(T::Boolean) }
    def will_save_change_to_user_hidden?; end
  end

  module GeneratedRelationMethods
    sig { returns(PrivateRelation) }
    def all; end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def and(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def annotate(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def create_with(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def distinct(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def eager_load(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def except(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def excluding(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def extending(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def extract_associated(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def filter_spam_for(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def from(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def group(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def having(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def in_order_of(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def includes(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def invert_where(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def joins(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def left_joins(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def left_outer_joins(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def limit(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def limit_execution_time(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def lock(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def merge(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def none(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def not_spammy(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def null_relation?(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def offset(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def only(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def optimizer_hints(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def or(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def order(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def preload(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def readonly(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def references(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def regroup(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def reorder(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def reselect(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def reverse_order(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def rewhere(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def select(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def spammy(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def strict_loading(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def structurally_compatible?(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def uniq!(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def unscope(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelationWhereChain) }
    def where(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def with(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def with_recursive(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def without(*args, &blk); end

    sig { params(args: T.untyped, blk: T.untyped).returns(PrivateRelation) }
    def without_ids(*args, &blk); end
  end

  module GeneratedSpammableClassMethods
    sig { returns(Symbol) }
    def spammable_user_foreign_key; end
  end

  module GeneratedSpammableMethods
    sig { params(viewer: User).returns(Promise[T::Boolean]) }
    def async_hide_from_user?(viewer); end

    sig { params(viewer: User).returns(T::Boolean) }
    def hide_from_user?(viewer); end

    sig { returns(Integer) }
    def set_user_hidden; end

    sig { returns(T::Boolean) }
    def spammy?; end

    sig { returns(Symbol) }
    def user_association_for_spammy; end

    sig { params(viewer: User).returns(T::Boolean) }
    def user_authored_content?(viewer); end
  end

  class PrivateAssociationRelation < ::ActiveRecord::AssociationRelation
    include CommonRelationMethods
    include GeneratedAssociationRelationMethods

    Elem = type_member { { fixed: ::IssueEventAuthor } }

    sig { returns(T::Array[::IssueEventAuthor]) }
    def to_a; end

    sig { returns(T::Array[::IssueEventAuthor]) }
    def to_ary; end
  end

  class PrivateAssociationRelationWhereChain < PrivateAssociationRelation
    Elem = type_member { { fixed: ::IssueEventAuthor } }

    sig { params(args: T.untyped).returns(PrivateAssociationRelation) }
    def associated(*args); end

    sig { params(args: T.untyped).returns(PrivateAssociationRelation) }
    def missing(*args); end

    sig { params(opts: T.untyped, rest: T.untyped).returns(PrivateAssociationRelation) }
    def not(opts, *rest); end
  end

  class PrivateCollectionProxy < ::ActiveRecord::Associations::CollectionProxy
    include CommonRelationMethods
    include GeneratedAssociationRelationMethods

    Elem = type_member { { fixed: ::IssueEventAuthor } }

    sig do
      params(
        records: T.any(::IssueEventAuthor, T::Enumerable[T.any(::IssueEventAuthor, T::Enumerable[::IssueEventAuthor])])
      ).returns(PrivateCollectionProxy)
    end
    def <<(*records); end

    sig do
      params(
        records: T.any(::IssueEventAuthor, T::Enumerable[T.any(::IssueEventAuthor, T::Enumerable[::IssueEventAuthor])])
      ).returns(PrivateCollectionProxy)
    end
    def append(*records); end

    sig { returns(PrivateCollectionProxy) }
    def clear; end

    sig do
      params(
        records: T.any(::IssueEventAuthor, T::Enumerable[T.any(::IssueEventAuthor, T::Enumerable[::IssueEventAuthor])])
      ).returns(PrivateCollectionProxy)
    end
    def concat(*records); end

    sig { returns(T::Array[::IssueEventAuthor]) }
    def load_target; end

    sig do
      params(
        records: T.any(::IssueEventAuthor, T::Enumerable[T.any(::IssueEventAuthor, T::Enumerable[::IssueEventAuthor])])
      ).returns(PrivateCollectionProxy)
    end
    def prepend(*records); end

    sig do
      params(
        records: T.any(::IssueEventAuthor, T::Enumerable[T.any(::IssueEventAuthor, T::Enumerable[::IssueEventAuthor])])
      ).returns(PrivateCollectionProxy)
    end
    def push(*records); end

    sig do
      params(
        other_array: T.any(::IssueEventAuthor, T::Enumerable[T.any(::IssueEventAuthor, T::Enumerable[::IssueEventAuthor])])
      ).returns(T::Array[::IssueEventAuthor])
    end
    def replace(other_array); end

    sig { returns(PrivateAssociationRelation) }
    def scope; end

    sig { returns(T::Array[::IssueEventAuthor]) }
    def target; end

    sig { returns(T::Array[::IssueEventAuthor]) }
    def to_a; end

    sig { returns(T::Array[::IssueEventAuthor]) }
    def to_ary; end
  end

  class PrivateRelation < ::ActiveRecord::Relation
    include CommonRelationMethods
    include GeneratedRelationMethods

    Elem = type_member { { fixed: ::IssueEventAuthor } }

    sig { returns(T::Array[::IssueEventAuthor]) }
    def to_a; end

    sig { returns(T::Array[::IssueEventAuthor]) }
    def to_ary; end
  end

  class PrivateRelationWhereChain < PrivateRelation
    Elem = type_member { { fixed: ::IssueEventAuthor } }

    sig { params(args: T.untyped).returns(PrivateRelation) }
    def associated(*args); end

    sig { params(args: T.untyped).returns(PrivateRelation) }
    def missing(*args); end

    sig { params(opts: T.untyped, rest: T.untyped).returns(PrivateRelation) }
    def not(opts, *rest); end
  end
end
