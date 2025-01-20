require "codeowners"
require "minitest/spec"
require "minitest/autorun"

describe Codeowners do
  it "preserves order of matches when later rule applies" do
    owners = Codeowners::File.new(<<-CODEOWNERS)
      * @global
      /test/ @global
    CODEOWNERS

    legacy = owners.for_legacy(["README.md", "test/foo"])
    tree = owners.for_with_tree(["README.md", "test/foo"])
    graph = owners.for_with_graph(["README.md", "test/foo"])

    assert_equal patterns(legacy), patterns(tree)
    assert_equal patterns(legacy), patterns(graph)
  end

  [:for_legacy, :for_with_tree, :for_with_graph].each do |for_method| describe for_method do
    before(:all) do
      Codeowners::File.class_eval do
        alias_method :for, for_method
      end
    end

    def assert_owners(expected, owners_for)
      assert_equal expected.sort, owners_for.keys.map(&:to_s).sort
    end

    it "returns all users without a path specified" do
      @owners = Codeowners::File.new(<<-EOF)
        * foo@example.com @owner @org/team
        *.md @focused
      EOF
      assert_owners ["foo@example.com", "@owner", "@org/team"], @owners.for("README")
    end

    it "returns empty without paths specified" do
      file = Codeowners::File.new("file3 @owner")

      assert_owners [], file.for([])
    end

    it "returns empty if passed unrecognized paths" do
      file = Codeowners::File.new("file3 @owner")

      assert_owners [], file.for(["file4"])
    end

    it "returns users with matching path" do
      @owners = Codeowners::File.new(<<-EOF)
        * foo@example.com @owner @org/team
        *.md @focused
      EOF
      assert_owners ["@focused"], @owners.for("README.md")
    end

    it "returns owners for multiple paths" do
      @owners = Codeowners::File.new(<<-EOF)
        * foo@example.com @owner @org/team
        *.md @focused
      EOF

      assert_owners ["foo@example.com", "@owner", "@org/team", "@focused"],
        @owners.for("Rakefile", "README.md")
    end

    it "returns unique results even when multiple paths match the same rule" do
      @owners = Codeowners::File.new(<<-EOF)
        * @foo
      EOF

      owners_to_rules = @owners.for("foo.md", "bar.md")

      assert_owners ["@foo"], owners_to_rules
      rules = owners_to_rules.values.first
      assert_equal 1, rules.count
      assert_equal "*", rules.first.pattern.to_s
    end

    it "returns teams with matching path" do
      owners = Codeowners::File.new("LICENSE @org/legal")
      assert_owners ["@org/legal"], owners.for("LICENSE")
    end

    it "returns users matching any path" do
      owners = Codeowners::File.new("*.rb @ruby-programmer\n*.py @python-programmer")

      assert_owners ["@ruby-programmer"], owners.for("foo.rb")
      assert_owners ["@python-programmer"], owners.for("foo.py")
    end

    it "does not returns users with non-matching path" do
      @owners = Codeowners::File.new(<<-EOF)
        * foo@example.com @owner @org/team
        *.md @focused
      EOF
      assert_owners ["foo@example.com", "@owner", "@org/team"], @owners.for("README")
    end

    it "ignores comments and newlines" do
      assert_owners ["@owner"], Codeowners::File.new("# README\n\n\n* @owner").for("README")
    end

    it "ignores duplicate owners" do
      owners = Codeowners::File.new("* @owner @owner")
      assert_owners ["@owner"], owners.for("README")
    end

    it "doesn't blow up if it can't parse the file" do
      owners = Codeowners::File.new("user@example.com\nper-file *.js=js@example.com")

      assert_equal 1, owners.rules.count
      assert_equal 1, owners.errors.count
      assert_equal [1], owners.rules.map(&:line)
      assert_equal [2], owners.errors.map(&:line)
    end

    it "handles nested paths" do
      owners = Codeowners::File.new("foo/bar @owner")
      assert_owners ["@owner"], owners.for(["foo/bar"])
    end

    it "handles glob matching" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        path/**/* @owner
        foo/ @foo
        **/.eslintrc.json  @json
        lib/service* @lib
      CODEOWNERS

      assert_owners ["@owner"], owners.for(["path/thing.rb"])
      assert_owners ["@owner"], owners.for(["path/to/the/thing.rb"])
      assert_owners ["@foo"], owners.for(["foo/thing"])
      assert_owners ["@foo"], owners.for(["foo/to/the/thing"])
      assert_owners ["@json"], owners.for(["test/js/.eslintrc.json"])
      assert_owners ["@json"], owners.for([".eslintrc.json"])
      assert_owners ["@lib"], owners.for(["lib/service_file.java"])
    end

    it "handles nested glob matching and directories" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        app/models/animals @animals
        app/models/foo* @foo
      CODEOWNERS

      assert_owners ["@foo", "@animals"], owners.for(["app/models/foo_bar.rb", "app/models/animals/dog.rb"])
    end

    it "handles path segment matching" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        models/ @models-owner
        assets @assets-owner
        repo* @repo-owner
        path/to/ @path-owner
        /modules/thanos-*/** @thanos-owner
      CODEOWNERS

      assert_owners ["@models-owner"], owners.for(["app/models/user.rb"])
      assert_owners ["@models-owner"], owners.for(["models/user.rb"])
      assert_owners [], owners.for(["models", "data/models"])

      assert_owners ["@assets-owner"], owners.for(["app/assets/frameworks.js"])
      assert_owners ["@assets-owner"], owners.for(["app/assets"])

      assert_owners ["@repo-owner"], owners.for(["data/repositories/default.git"])
      assert_owners ["@repo-owner"], owners.for(["public/reports/2019.html"])
      assert_owners ["@repo-owner"], owners.for(["app/models/repo.rb"])

      assert_owners ["@path-owner"], owners.for(["path/to/foo.txt"])
      assert_owners [], owners.for(["my/path/to/foo.txt"])

      assert_owners [], owners.for(["modules/thanos-sidecar.service.erb"])
      assert_owners ["@thanos-owner"], owners.for(["modules/thanos-service/foo.erb"])
    end

    it "handles single asterisk" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        /packages/core/** @core-owner
        /packages/* @packages-owner
      CODEOWNERS

      assert_owners ["@core-owner"], owners.for(["packages/core/testing/src/test_bed_common.ts"])
      assert_owners ["@packages-owner"], owners.for(["packages/file"])

      assert_owners ["@packages-owner", "@core-owner"], owners.for(["packages/file", "packages/core/foo"])
    end

    it "handles top-level directory" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        / @no-one
      CODEOWNERS

      assert_owners [], owners.for(["README.txt"])
      assert_owners [], owners.for(["/src/App.jsx"])
    end

    it "identical trailing paths with different owners" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        server/pull-requests/** @pull-requests
        server/issues/** @issues
      CODEOWNERS

      assert_owners ["@pull-requests", "@issues"], owners.for(["server/pull-requests/app/command/merge.js", "server/issues/app/command/merge.js"])
    end

    it "handles glob paths with trailing slash" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        src/**/*owner*/ @owner
      CODEOWNERS

      assert_owners [], owners.for(["src/utils/ownerDir.js"])
      assert_owners ["@owner"], owners.for(["src/utils/ownerDir/File.js"])
    end

    it "handles rules with backslashes" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        **/My\\ Config/ @owner
      CODEOWNERS

      assert_owners ["@owner"], owners.for(["App/My Config/Configuration.swift"])
    end

    it "handles rules with parentheses" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        file(old).txt @owner
      CODEOWNERS

      assert_owners ["@owner"], owners.for(["src/file(old).txt"])
    end

    it "handles top level with surrounded with forward slashes" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        /.gitignore/ @owner
      CODEOWNERS

      assert_owners [], owners.for([".gitignore"])
    end

    it "dir rule doesn't match file" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        /Vendor/sub-dir/  @owner
      CODEOWNERS

      assert_owners [], owners.for(["Vendor/sub-dir"])
    end

    it "matches correct rule when paths collide" do
      file = Codeowners::File.new(<<-CODEOWNERS)
        *               @global
        /test/kitchen   @global
      CODEOWNERS

      owners = file.for(["test/kitchen/foo", "test/kitchen/foo/bar/test_spec.rb"])

      assert_equal ["/test/kitchen"], patterns(owners).map(&:pattern)
    end

    it "handles single asterisk as glob for directory" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        foo/*/dev/*              @dev
        foo/*/bar/production/*   @prod
      CODEOWNERS

      assert_owners ["@dev"], owners.for(["foo/123/dev/config"])
      assert_owners [], owners.for(["foo/123/dev/config/custom.yaml"])
      assert_owners ["@dev"], owners.for(["foo/123/dev/config", "foo/123/dev/config/custom.yaml"])

      assert_owners ["@prod"], owners.for(["foo/123/bar/production/config.yaml"])
      assert_owners [], owners.for(["foo/123/bar/production/config/config.yaml"])
      assert_owners [], owners.for(["foo/123/bar/production.yaml"])
    end

    it "rejects patterns with more than two asterisks" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        e2e/***  @e2e
      CODEOWNERS

      assert_owners [], owners.for(["e2e/compat_test.go"])
    end

    it "handles question marks for single-character blobs" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        * @fallback
        f?o @foo
      CODEOWNERS

      assert_owners ["@foo"], owners.for(["a/foo/b"])
      assert_owners ["@foo"], owners.for(["a/fxo/b"])
      assert_owners ["@fallback"], owners.for(["a/fooo/b"])
      assert_owners ["@fallback"], owners.for(["a/fo/b"])
    end

    it "handles regexp-like globbing patterns" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        *.md @docs
      CODEOWNERS

      assert_owners ["@docs"], owners.for(["README.md"])
      assert_owners ["@docs"], owners.for([".github/CONTRIBUTING.md"])
      assert_owners [], owners.for(["about-amd"])
    end

    it "prefers the last rule when there are duplicate patterns" do
      owners = Codeowners::File.new(<<-CODEOWNERS)
        *   @first
        *   @second
      CODEOWNERS

      assert_owners ["@second"], owners.for(["anything.txt"])
    end
  end end

  def patterns(rules_by_owner)
    rules_by_owner
      .values
      .flatten
      .sort
      .map(&:pattern)
  end
end
