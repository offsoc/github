# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :personal_avatar_reader do |access|
    access.ensure_context :avatar, :user
    access.allow :personal_avatar_reader
  end

  define_access :read_avatar do |access|
    access.ensure_context :owner_type, :owner_id, :avatar
    access.allow :avatar_reader
  end

  define_access :create_avatar do |access|
    access.ensure_context :owner # the object the avatar identifies
    access.allow :avatar_writer
  end
end
