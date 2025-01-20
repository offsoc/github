# typed: strict
# frozen_string_literal: true

module Site::Contentful::Readme
  class BaseStory
    sig { returns(String) }
    def slug; end

    sig { returns(Date) }
    def publication_date; end

    sig { returns(T.untyped) }
    def topics; end

    sig { returns(String) }
    def heading; end

    sig { returns(T.untyped) }
    def seo; end

    sig { returns(String) }
    def meta_text; end

    sig { returns(T.untyped) }
    def hero_image; end

    sig { returns(String) }
    def label; end

    sig { returns(String) }
    def name; end

    sig { returns(String) }
    def subheading; end

    sig { returns(T.untyped) }
    def thumbnail; end

    sig { returns(Date) }
    def updated_at; end

    sig { returns(::Contentful::ContentType) }
    def content_type; end
  end
end
