# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::GistFile`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::GistFile`.

class Hydro::Schemas::Github::V1::Entities::GistFile
  sig do
    params(
      filename: T.nilable(String),
      language: T.nilable(String),
      mime_type: T.nilable(String),
      raw_url: T.nilable(String),
      size: T.untyped
    ).void
  end
  def initialize(filename: nil, language: nil, mime_type: nil, raw_url: nil, size: nil); end

  sig { void }
  def clear_filename; end

  sig { void }
  def clear_language; end

  sig { void }
  def clear_mime_type; end

  sig { void }
  def clear_raw_url; end

  sig { void }
  def clear_size; end

  sig { returns(String) }
  def filename; end

  sig { params(value: String).void }
  def filename=(value); end

  sig { returns(String) }
  def language; end

  sig { params(value: String).void }
  def language=(value); end

  sig { returns(String) }
  def mime_type; end

  sig { params(value: String).void }
  def mime_type=(value); end

  sig { returns(String) }
  def raw_url; end

  sig { params(value: String).void }
  def raw_url=(value); end

  sig { returns(T.untyped) }
  def size; end

  sig { params(value: T.untyped).void }
  def size=(value); end
end
