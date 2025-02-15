# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Site::Contentful::Readme::Topic`.
# Please instead update this file by running `bin/tapioca dsl Site::Contentful::Readme::Topic`.

class Site::Contentful::Readme::Topic
  sig { returns(::Contentful::ContentType) }
  def content_type; end

  sig { returns(DateTime) }
  def created_at; end

  sig { returns(T.nilable(String)) }
  def id; end

  sig { returns(T.untyped) }
  def meta_text; end

  sig { returns(T.nilable(String)) }
  def name; end

  sig { returns(T.untyped) }
  def public; end

  sig { returns(T.nilable(String)) }
  def slug; end

  sig { returns(T.nilable(String)) }
  def subheading; end

  sig { returns(String) }
  def type; end

  sig { returns(DateTime) }
  def updated_at; end
end
