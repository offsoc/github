require "codeowners"
require "minitest/spec"
require "minitest/autorun"

describe Codeowners::Owner do

  describe "#email?" do
    it "returns true if the owner is an email address" do
      assert Codeowners::Owner.new("user@example.com").email?
      assert Codeowners::Owner.new("user+extra@example.com").email?
      assert Codeowners::Owner.new("user'extra@example.com").email?

      refute Codeowners::Owner.new("@username").email?
      refute Codeowners::Owner.new("@user_name").email?
      refute Codeowners::Owner.new("@org/team").email?
    end
  end

  describe "#username?" do
    it "returns true if the owner is an username" do
      assert Codeowners::Owner.new("@user").username?
      assert Codeowners::Owner.new("@user_name").username?

      refute Codeowners::Owner.new("user@example.com").username?
      refute Codeowners::Owner.new("@org/team").username?
    end
  end

  describe "#teamname?" do
    it "returns true if the owner is an teamname" do
      assert Codeowners::Owner.new("@org/team").teamname?
      assert Codeowners::Owner.new("@org/__team_name").teamname?

      refute Codeowners::Owner.new("user@example.com").teamname?
      refute Codeowners::Owner.new("@user").teamname?
      refute Codeowners::Owner.new("@user_name").teamname?
    end
  end

end
