require "codeowners"
require "minitest/spec"
require "minitest/autorun"

describe Codeowners::Rule do
  describe "#==" do
    it "returns true for a rule with the same properties" do
      rule_a = Codeowners::Rule.new(1, "README.md", [Codeowners::Owner.new("@monalisa")])
      rule_b = Codeowners::Rule.new(1, "README.md", [Codeowners::Owner.new("@monalisa")])

      assert_equal rule_a, rule_b
    end

    it "returns true for a rule with the same properties regardless of owner order" do
      rule_a = Codeowners::Rule.new(1, "README.md", [
        Codeowners::Owner.new("@monalisa"),
        Codeowners::Owner.new("@davinci"),
      ])
      rule_b = Codeowners::Rule.new(1, "README.md", [
        Codeowners::Owner.new("@davinci"),
        Codeowners::Owner.new("@monalisa"),
      ])

      assert_equal rule_a, rule_b
    end

    it "returns false for a rule with different properties" do
      rule = Codeowners::Rule.new(1, "README.md", [Codeowners::Owner.new("@monalisa")])
      different_line = Codeowners::Rule.new(2, "README.md", [Codeowners::Owner.new("@monalisa")])
      different_pattern = Codeowners::Rule.new(1, "example.rb", [Codeowners::Owner.new("@monalisa")])
      different_owner = Codeowners::Rule.new(1, "README.md", [Codeowners::Owner.new("@github/octocats")])

      refute_equal rule, different_line
      refute_equal rule, different_pattern
      refute_equal rule, different_owner
    end

    it "returns false for an object with a different inteface" do
      rule = Codeowners::Rule.new(1, "README.md", [Codeowners::Owner.new("@monalisa")])

      refute_equal rule, "A string"
      refute_equal rule, nil
    end
  end
end
