# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.
module Seeds
  module Objects
    module Git
      class Ref
        def self.find_or_create_branch_ref(repo:, ref_name:, target_ref_name: repo.default_branch)
          ref = repo.refs.find("refs/heads/#{ref_name}")
          return ref if ref

          if target_ref_name
            target_ref = repo.heads.find(target_ref_name)
            unless target_ref
              raise ArgumentError, "Could not branch #{ref_name} from #{target_ref_name} because #{target_ref_name} does not exist!"
            end
            repo.heads.create(ref_name, target_ref.target_oid, repo.owner)
          else
            # there isn't a base branch, so create a new one
            repo.refs.build("refs/heads/#{ref_name}")
          end
        end
      end
    end
  end
end
