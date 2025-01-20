require "codeowners"
require "minitest/spec"
require "minitest/autorun"

describe Codeowners::Pattern do

  # https://git-scm.com/docs/gitignore#_pattern_format
  describe "#match?" do
    def assert_match(pattern_string, path)
      pattern = Codeowners::Pattern.new(pattern_string)
      assert pattern.match?(path),
        "Expected #{ pattern_string.inspect } to match #{ path.inspect } but didn't."
    end

    def refute_match(pattern_string, path)
      pattern = Codeowners::Pattern.new(pattern_string)
      refute pattern.match?(path),
        "Expected #{ pattern_string.inspect } to NOT match #{ path.inspect } but did."
    end

    # If the pattern ends with a slash, it is removed for the purpose of the
    # following description, but it would only find a match with a directory.
    # In other words, foo/ will match a directory foo and paths underneath it,
    # but will not match a regular file or a symbolic link foo (this is
    # consistent with the way how pathspec works in general in Git).
    it "handles patterns with a trailing slash" do
      assert_match "foo/", "foo/"
      assert_match "foo/", "foo/bar"
      assert_match "foo/", "foo/bar/baz.md"

      refute_match "foo/", "foo"
      refute_match "foo/", "bar/foo"

      assert_match "foo/bar/", "foo/bar/"
      assert_match "foo/bar/", "foo/bar/baz.md"
      refute_match "foo/bar/", "foo/bar"
    end

    # If the pattern does not contain a slash /, Git treats it as a shell glob
    # pattern and checks for a match against the pathname relative to the
    # location of the .gitignore file (relative to the toplevel of the work
    # tree if not from a .gitignore file).
    it "treats patterns without slashes as a shell glob" do
      assert_match "*", "foo"
      assert_match "*", "foo/bar"
      assert_match "*", "foo/bar/baz.md"

      assert_match "*.js", "foo.js"
      assert_match "*.js", "foo/bar.js"
      refute_match "*.js", "foo"
      refute_match "*.js", "foo.md"
      refute_match "*.js", "foo/bar.md"

      assert_match "foo", "foo"
      assert_match "foo", "foo/bar"
      assert_match "foo", "foo/bar.js"
      assert_match "foo", "foo/foo.js"
      assert_match "foo", "bar/foo"
      refute_match "foo", "foo.js"
      refute_match "foo", "bar/foo.js"
    end

    # Otherwise, Git treats the pattern as a shell glob suitable for consumption
    # by fnmatch(3) with the FNM_PATHNAME flag: wildcards in the pattern will
    # not match a / in the pathname. For example, "Documentation/*.html" matches
    # "Documentation/git.html" but not "Documentation/ppc/ppc.html" or
    # "tools/perf/Documentation/perf.html".
    it "acts like fnmatch(3) with FNM_PATHNAME flag for patterns with slashes" do
      assert_match "foo/bar", "foo/bar"
      assert_match "foo/bar", "foo/bar/baz"
      refute_match "foo/bar", "baz/foo/bar"

      assert_match "foo/*", "foo/bar"
      assert_match "foo/*", "foo/bar.txt"
      refute_match "foo/*", "baz/foo/bar"
    end

    # A leading "**" followed by a slash means match in all directories. For
    # example, "**/foo" matches file or directory "foo" anywhere, the same as
    # pattern "foo". "**/foo/bar" matches file or directory "bar" anywhere that
    # is directly under directory "foo".
    it "handles leading '**/' correctly" do
      assert_match "**/foo", "foo"
      assert_match "**/foo", "foo/baz"
      assert_match "**/foo", "bar/foo"
      assert_match "**/foo", "bar/foo/baz"
      refute_match "**/foo", "bar"

      assert_match "**/foo/bar", "foo/bar"
      assert_match "**/foo/bar", "foo/bar/baz.txt"
      assert_match "**/foo/bar", "baz/foo/bar"
      refute_match "**/foo/bar", "foo/baz/bar"
    end

    # A trailing "/**" matches everything inside. For example, "abc/**" matches
    # all files inside directory "abc", relative to the location of the
    # .gitignore file, with infinite depth.
    it "handles trailing '/**' correctly" do
      assert_match "foo/**", "foo/bar"
      assert_match "foo/**", "foo/bar/baz.html"
      refute_match "foo/**", "bar"
      refute_match "foo/**", "bar/foo"
      refute_match "foo/**", "bar/foo/baz.html"
    end

    # A slash followed by two consecutive asterisks then a slash matches zero or
    # more directories. For example, "a/**/b" matches "a/b", "a/x/b", "a/x/y/b"
    # and so on.
    it "handles inline '/**/' correctly" do
      assert_match "a/**/b", "a/b"
      assert_match "a/**/b", "a/b/c"
      assert_match "a/**/b", "a/x/b"
      assert_match "a/**/b", "a/x/b/c"
      assert_match "a/**/b", "a/x/y/b"
      refute_match "a/**/b", "z/a/b"
      refute_match "a/**/b", "b/c"
    end
  end

end
