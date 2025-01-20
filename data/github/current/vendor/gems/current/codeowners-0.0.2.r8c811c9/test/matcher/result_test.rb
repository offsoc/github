require "codeowners"
require "minitest/spec"
require "minitest/autorun"

class StringOwnerResolver
  def initialize
    @owners = []
  end

  def register_owners(_)
  end

  def resolve(owner)
    "The Owner is: #{owner}"
  end
end

class FauxEmailResolver
  def initialize
    @owners = []
  end

  def register_owners(_)
  end

  # Resolve to @foo if given @foo, otherwise resolve foo@example.com to @foo
  def resolve(owner)
    if owner[0] == "@"
      owner
    else
      "@#{owner.gsub(/@example.com$/, "")}"
    end
  end

  def resolve_many(owners)
    owners.filter_map { |o| resolve(o) }
  end
end

class NilOwnerResolver
  def initialize
    @owners = []
  end

  def register_owners(_)
  end

  def resolve(*)
    nil
  end
end

describe Codeowners::Matcher::Result do
  describe "without a specified owner resolver" do
    before(:all) do
      @owners = create_owners_from_file
    end

    it "can return rules mapped to owners" do
      result = @owners.match("README.md", "app/assets/upload.js")

      by_rule = result.owners_by_rule

      assert_equal 2, by_rule.keys.count
      assert_equal [2, 1], by_rule.keys.map(&:line)

      _, owners = by_rule.find { |rule, _| rule.line == 2 }
      assert_equal ["@owner", "@org/team"], owners.map(&:to_s)
    end

    it "can return the paths owned by a given owner without case sensitivity" do
      result = @owners.match("README.md", "app/assets/upload.js", "other.rb")

      assert_equal [], result.paths_for_owner("@i_do_not_exist")
      assert_equal ["other.rb"], result.paths_for_owner("@collaborator")
      assert_equal ["app/assets/upload.js"], result.paths_for_owner("@org/team")
      assert_equal ["README.md", "app/assets/upload.js"], result.paths_for_owner("@owner")
      assert_equal result.paths_for_owner("@owner"), result.paths_for_owner("@OWnER")
    end

    it "can return owners for a path" do
      result = @owners.match("README.md", "app/assets/upload.js", "other.rb")

      owner = Codeowners::Owner.new("@owner")
      team = Codeowners::Owner.new("@org/team")
      collaborator = Codeowners::Owner.new("@collaborator")

      assert_equal [], result.owners_for_path("some gibberish")
      assert_equal [owner], result.owners_for_path("README.md")
      assert_equal [owner, team], result.owners_for_path("app/assets/upload.js")
      assert_equal [collaborator], result.owners_for_path("other.rb")
    end

    it "respects nil overrides" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        * @org/team
        docs/

      CODEOWNERS

      result = owners.match("app/assets/upload.md", "docs/hello_world.md")

      team = Codeowners::Owner.new("@org/team")

      assert_equal [], result.owners_for_path("some gibberish")
      assert_equal [team], result.owners_for_path("app/assets/upload.md")
      assert_equal [], result.owners_for_path("docs/hello_world.md")
    end
  end

  describe "with a specified owner resolver" do
    it "transforms the owner class as approriate" do
      owners_from_file = create_owners_from_file(owner_resolver: StringOwnerResolver.new)

      result = owners_from_file.match("README.md", "app/assets/upload.js")

      by_rule = result.owners_by_rule

      _, owners = by_rule.find { |rule, _| rule.line == 2 }
      assert_equal ["The Owner is: @owner", "The Owner is: @org/team"] , owners.map(&:to_s)
    end

    it "can find paths for owner via the specified resolver" do
      owners_from_file = Codeowners::File.new(<<-CODEOWNERS, owner_resolver: FauxEmailResolver.new)
      *.md owner@example.com
      *.rb @rubycoder

      CODEOWNERS

      result = owners_from_file.match("README.md", "app/assets/upload.js", "other.rb", "CHANGELOG.md")

      assert_equal ["README.md", "CHANGELOG.md"], result.paths_for_owner("@owner")
      assert_equal ["other.rb"], result.paths_for_owner("@rubycoder")
    end

    it "does not return results if the owner is nonexistent" do
      owners_from_file = create_owners_from_file(owner_resolver: NilOwnerResolver.new)
      result = owners_from_file.match("README.md", "app/assets/upload.js")

      by_rule = result.owners_by_rule
      assert_empty by_rule
    end

    it "does not include nil owners in owners_for_path" do
      owners_from_file = create_owners_from_file(owner_resolver: NilOwnerResolver.new)
      result = owners_from_file.match("README.md", "app/assets/upload.js")

      assert_equal [], result.owners_for_path("app/assets/upload.js")
    end
  end

  it "matches on characters that must be escaped in the CODEOWNERS file with the MultibyteParser" do
    file = Codeowners::File.new(<<-CODEOWNERS, parser_class: Codeowners::MultibyteParser)
      \\ file\\ spaced.rb @org/spacer
      file\\	tabbed.rb @org/tabber
      file\\\\backslashed.rb @org/backslasher
      file\\\\\\ tripleslashed.rb @org/tripleslasher
      file\\#\\ hashtagged.rb @org/hashtagger
    CODEOWNERS

    owners = file.match(" file spaced.rb").owners_by_rule.values.flatten.map(&:to_s)
    assert_equal ["@org/spacer"], owners

    owners = file.match("file	tabbed.rb").owners_by_rule.values.flatten.map(&:to_s)
    assert_equal ["@org/tabber"], owners

    owners = file.match("file\\backslashed.rb").owners_by_rule.values.flatten.map(&:to_s)
    assert_equal ["@org/backslasher"], owners

    owners = file.match("file\\ tripleslashed.rb").owners_by_rule.values.flatten.map(&:to_s)
    assert_equal ["@org/tripleslasher"], owners

    owners = file.match("file# hashtagged.rb").owners_by_rule.values.flatten.map(&:to_s)
    assert_equal ["@org/hashtagger"], owners
  end

  def create_owners_from_file(owner_resolver = {})
    Codeowners::File.new(<<-CODEOWNERS, **owner_resolver)
        *.md @owner
        *.js @owner @org/team
        *.rb @collaborator

      CODEOWNERS
  end
end
