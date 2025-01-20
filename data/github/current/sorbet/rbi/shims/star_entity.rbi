# typed: strict
# frozen_string_literal: true

class StarEntity
  extend T::Sig

  sig { returns(Integer) }
  def id; end

  sig { returns(Integer) }
  def user_id; end

  sig { returns(Integer) }
  def starrable_id; end

  sig { returns(String) }
  def starrable_type; end

  sig { returns(T::Boolean) }
  def user_hidden; end

  sig { returns(Time) }
  def created_at; end
end
