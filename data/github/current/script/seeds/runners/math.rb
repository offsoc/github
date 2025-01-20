# typed: strict
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Math < Seeds::Runner
      extend T::Sig

      sig { returns(String) }
      def self.help
        <<~HELP
        Create repo containing a markdown file with math.
        HELP
      end

      sig { params(options: T::Hash[Symbol, T.untyped]).void }
      def self.run(options = {})
        new.run
      end

      sig { void }
      def run
        mona = Objects::User.monalisa

        # make seed idempotent
        delete_records_if_exists(mona)

        # If you need to make changes to the math repository, please see these instructions:
        # https://thehub.github.com/epd/engineering/products-and-services/dotcom/testing/#creating-and-updating-example-repositories
        repo = setup_math_repository(mona)

        issue = create_math_issue(mona)
        create_math_pr(repo, mona)
        create_math_discussion(repo, mona)

        create_full_math_gist(mona)
        create_simple_math_gist(mona)
        create_other_math_gist(mona)
      end

      private

      sig { params(user: User).void }
      def delete_records_if_exists(user)
        puts "Removing old objects...."
        Repository.where(owner: user, name: "math").destroy_all

        ::Gist.where("user_id = ? AND description LIKE ?", user.id, "%math%").destroy_all
      end

      sig { params(mona: User).returns(Repository) }
      def setup_math_repository(mona)
        puts "Creating math repository..."

        repo = Seeds::Objects::Repository.restore_premade_repo(
          owner_name: mona,
          repo_name: "math",
          location_premade_git: "test/fixtures/git/examples/math.git",
          is_public: true,
        )
        repo.turn_on_discussions(actor: repo.owner, instrument: false)
        repo
      end

      sig { params(repo: Repository, mona: User).void }
      def create_math_pr(repo, mona)
        puts "Creating math pull request, review, and review comment..."
        puts "Creating commit"
        commit1 = Seeds::Objects::Commit.create(
          repo: repo,
          committer: mona,
          branch_name: "master",
          message: "Yo, I heard you like math.",
          files: { "math.md" => math_body_full }
        )
        commit = repo.commits.create({ message: "Yo, I heard you like math", committer: mona }, commit1.oid) do |files|
          files.add "anothermathfile.md", math_body_full
        end

        puts "Creating pull request"
        base_ref = repo.heads.first
        head_ref = repo.refs.find("refs/heads/moremath")
        pr = ::PullRequest.create_for!(
          repo,
          user: mona,
          title: "Add some more math",
          body: math_body_full,
          head: head_ref.name,
          base: repo.refs.first.name
        )

        puts "Creating pull request review"
        prr = ::PullRequestReview.create(
          pull_request: pr,
          user: mona,
          state: :approved,
          head_sha: pr.head_sha,
          body: math_body_simple,
          submitted_at: Time.now
        )

        puts "Creating pull request review thread and comment"
        review_thread = ::PullRequestReviewThread.new(
          pull_request_review: prr,
          pull_request: pr,
        )

        diff = pr.async_diff(end_commit_oid: pr.head_sha).sync
        path = diff.deltas.first.path.dup
        review_thread.build_first_diff_position_comment(
          user: mona,
          body: chemistry,
          diff: diff,
          position: 1,
          path: path,
        ).tap(&:save)
      end

      sig { params(mona: User).returns(IssueComment) }
      def create_math_issue(mona)
        puts "Creating math issue and issue comment..."
        issue = Seeds::Objects::Issue.create(
          repo: Repository.where(name: "math").first,
          actor: mona,
          title: "Math Issue",
          body:
            <<~EOF
            ```
            $$
            1 +  \\frac{q^2}{(1-q)}+\\frac{q^6}{(1-q)(1-q^2)}+\\cdots =
                    \\prod_{j=0}^{\\infty}\\frac{1}{(1-q^{5j+2})(1-q^{5j+3})},
                    \\quad\\quad \\text{for $|q| < 1$}.
            $$
            ```

            $$
            1 +  \\frac{q^2}{(1-q)}+\\frac{q^6}{(1-q)(1-q^2)}+\\cdots =
                    \\prod_{j=0}^{\\infty}\\frac{1}{(1-q^{5j+2})(1-q^{5j+3})},
                    \\quad\\quad \\text{for $|q| < 1$}.
            $$
            EOF
        )
        Seeds::Objects::IssueComment.create(
          issue: issue,
          user: mona,
          body: math_body_simple
        )
      end

      sig { params(mona: User).void }
      def create_full_math_gist(mona)
        puts "Creating math gist and gist comment..."
        math_gist = Seeds::Objects::Gist.create(
          user: mona,
          contents: [
            {
              name: "all_the_math.md",
              value: math_body_full,
            }
          ]
        )
        math_gist.update_attribute!(:description, "full math gist")
      end

      sig { params(mona: User).void }
      def create_simple_math_gist(mona)
        puts "Creating math gist and gist comment..."
        math_gist = Seeds::Objects::Gist.create(
          user: mona,
          contents: [
            {
              name: "just_some_math.md",
              value: math_body_simple,
            }
          ]
        )
        math_gist.update_attribute!(:description, "simple math gist")
        Seeds::Objects::GistComment.create(
          user: mona,
          gist: math_gist,
          body: chemistry
        )
      end

      sig { params(mona: User).void }
      def create_other_math_gist(mona)
        puts "Creating math gist and gist comment..."
        math_gist = Seeds::Objects::Gist.create(
          user: mona,
          contents: [
            {
              name: "other_math.md",
              value: math_other,
            }
          ]
        )

        math_gist.update_attribute!(:description, "other math gist")
      end

      sig { params(repo: Repository, mona: User).void }
      def create_math_discussion(repo, mona)
        """Creating math discussion..."""
        discussion = ::Discussion.create!(
          repository: repo,
          user: mona,
          title: Faker::Lorem.question,
          body: math_body_simple,
          category: ::DiscussionCategory.find_by(name: DiscussionCategory::ANNOUNCEMENTS_NAME),
        )
        ::DiscussionComment.create!(
          discussion: discussion,
          user: mona,
          body: chemistry
        )
        ::DiscussionComment.create!(
          discussion: discussion,
          user: mona,
          body: math_other
        )
        ::DiscussionComment.create!(
          discussion: discussion,
          user: mona,
          body: maxwell
        )
        ::DiscussionComment.create!(
          discussion: discussion,
          user: mona,
          body: matrices
        )
        ::DiscussionComment.create!(
          discussion: discussion,
          user: mona,
          body: ui_redressing
        )
      end

      sig { returns(String) }
      def maxwell
        <<~EOF
        ## Maxwell's Equations

        $$
        \\begin{align}
          \\nabla \\times \\vec{\\mathbf{B}} -\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} &amp; = \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\\\
          \\nabla \\cdot \\vec{\\mathbf{E}} &amp; = 4 \\pi \\rho \\\\
          \\nabla \\times \\vec{\\mathbf{E}}\\, +\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{B}}}{\\partial t} &amp; = \\vec{\\mathbf{0}} \\\\
          \\nabla \\cdot \\vec{\\mathbf{B}} &amp; = 0
        \\end{align}
        $$


        ```
        $$
        \\begin{align}
          \\nabla \\times \\vec{\\mathbf{B}} -\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} &amp; = \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\\\
          \\nabla \\cdot \\vec{\\mathbf{E}} &amp; = 4 \\pi \\rho \\\\
          \\nabla \\times \\vec{\\mathbf{E}}\\, +\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{B}}}{\\partial t} &amp; = \\vec{\\mathbf{0}} \\\\
          \\nabla \\cdot \\vec{\\mathbf{B}} &amp; = 0
        \\end{align}
        $$
        ```

        EOF
      end

      sig { returns(String) }
      def matrices
        <<~EOF
        ## matrices

        $$
        \\begin{array}{|c|c|c|c|}
        \\hline 1 & 2 & 3 & 4 \\\\
        \\hline a & b & c & d \\\\
        \\hline x & y & z & w \\\\
        \\hline
        \\end{array}
        $$

        ```
        $$
        \\begin{array}{|c|c|c|c|}
        \\hline 1 & 2 & 3 & 4 \\\\\\
        \\hline a & b & c & d \\\\\\
        \\hline x & y & z & w \\\\\\
        \\hline
        \\end{array}
        $$
        ```

        $$\\begin{pmatrix} 1 & 2 & 3 & 4 \\\\ a & b & c & d
        \\\\ x & y & z & w \\end{pmatrix}$$

        ```
        $$\\begin{pmatrix} 1 & 2 & 3 & 4 \\\\ a & b & c & d
        \\\\ x & y & z & w \\end{pmatrix}$$
        ```

        $$\\begin{matrix} 1 & 2 & 3 & 4 \\\\ a & b & c & d \\\\ x & y & z & w \\end{matrix}$$

        ```
        $$\\begin{matrix} 1 & 2 & 3 & 4 \\\\ a & b & c & d \\\\ x & y & z & w \\end{matrix}$$
        ```
        EOF
      end

      sig { returns(String) }
      def chemistry
        <<~EOF
            Cool, we can also do chemistry! $\\ce{SO4^2-}$

            $$
              \\ce{SO4^2-}
            $$


            ```
            Cool, we can also do chemistry! $\\ce{SO4^2-}$

            $$
              \\ce{SO4^2-}
            $$
            ```

            - `$\\ce{SO4^2-}$` --> $\\ce{SO4^2-}$
            - `$\\ce{^{227}_{90}Th+}$` --> $\\ce{^{227}_{90}Th+}$
            - `$\\ce{A\\bond{-}B\\bond{=}C\\bond{#}D}$` --> $\\ce{A\\bond{-}B\\bond{=}C\\bond{#}D}$
            - `$\\ce{CO2 + C -> 2CO}$` --> $\\ce{CO2 + C -> 2CO}$
            - `$\\ce{SO4^2- + Ba^2+ -> BaSO4 v}$` --> $\\ce{SO4^2- + Ba^2+ -> BaSO4 v}$
          EOF
      end

      sig { returns(String) }
      def math_body_simple
        <<~EOF
          This expression $\\sqrt{3x-1}+(1+x)^2$ is an example of an inline equation with `$` delimiter.

          ```
          This expression $\\sqrt{3x-1}+(1+x)^2$ is an example of an inline equation with `$` delimiter.
          ```

          $$
            \\left( \\sum_{k=1}^n a_k b_k \\right)^{\\!\\!2} \\leq
            \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)
          $$

          ```
          $$
            \\left( \\sum_{k=1}^n a_k b_k \\right)^{\\!\\!2} \\leq
            \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)
          $$
          ```


          - This expression shows math in a list item $\sqrt{1}$

          `- This expression shows math in a list item  $\sqrt{1}$`

          Math within a table <br>
          | column 1 | $5$ |
          | ---- | ----|
          | $\\sqrt{2}$ | $\\sqrt{3}$ |

          ```
          Math within a table
          | column 1 | $5$ |
          | ---- | ----|
          | $\\sqrt{2}$ | $\\sqrt{3}$ |
          ```


          - [ ] Here is math inside a task list: $\\sqrt{1}$

          ```
          - [ ] Here is math inside a task list: $\\sqrt{1}$
          ```
        EOF
      end

      sig { returns(String) }
      def math_other
        <<~EOF
        ## Other random math, chem and physics stuff that we may or may not support!

        $$
          \\int^1_\\kappa \\left[\\bigl(1-w^2\\bigr)\\bigl(\\kappa^2-w^2\\bigr)\\right]^{-1/2} dw = \\frac{4}{\\left(1+\\sqrt{\\kappa}\\,\\right)^2} K \\left(\\left(\\frac{1-\\sqrt{\\kappa}}{1+\\sqrt{\\kappa}}\\right)^{\\!\\!2}\\right)
        $$

        ```
        $$
          \\int^1_\\kappa \\left[\\bigl(1-w^2\\bigr)\\bigl(\\kappa^2-w^2\\bigr)\\right]^{-1/2} dw = \\frac{4}{\\left(1+\\sqrt{\\kappa}\\,\\right)^2} K \\left(\\left(\\frac{1-\\sqrt{\\kappa}}{1+\\sqrt{\\kappa}}\\right)^{\\!\\!2}\\right)
        $$
        ```

        - `$\\sin(\\frac{1+\\frac{1}{1+\\frac{1}{2}}}{2})$` --> $\\sin(\\frac{1+\\frac{1}{1+\\frac{1}{2}}}{2})$`
        - `$\\cancel$` --> $\\cancel$
        - `$\\chemfig{O=H}$` --> $\\chemfig{O=H}$
        - `$\\int_a^b x^2 \\, dx = \\left. \\frac 1 3 x^3 \\right|_a^b$` --> [doesn't work yet]
        - `$\\gg \\ll \\equiv \\bigcup_i A_i, \\bigcap_i A_i$`--> $\\gg \\ll \\equiv \\bigcup_i A_i, \\bigcap_i A_i$
        - `$\\mathbf A, \\vec A \\tilde A \\hat {\\mathbf A} \\hat A \\vec A \\cdot \\vec B$` --> $\\mathbf A, \\vec A \\tilde A \\hat {\\mathbf A} \\hat A \\vec A \\cdot \\vec B$
        - `$y', y'', y^{(n)}, \\dot x, \\ddot x, {\\partial x^2}, \\nabla f, \\nabla^2, \\psi, \\Box^2, \\phi$` --> $y', y'', y^{(n)}, \\dot x, \\ddot x, {\\partial x^2}, \\nabla f, \\nabla^2, \\psi, \\Box^2, \\phi$
        EOF
      end

      sig { returns(String) }
      def math_body_full
        <<~EOF
            Did somebody mention math?

            This expression $\\sqrt{3x-1}+(1+x)^2$ is an example of an inline equation with `$` delimiter.

            ```
            This expression $\\sqrt{3x-1}+(1+x)^2$ is an example of an inline equation with `$` delimiter.
            ```

            ## The Cauchy-Schwarz Inequality

            $$
            \\left( \\sum_{k=1}^n a_k b_k \\right)^{\\!\\!2} \\leq
            \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)
            $$

            ```
            $$
            \\left( \\sum_{k=1}^n a_k b_k \\right)^{\\!\\!2} \\leq
            \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)
            $$
            ```

            ## A Cross Product Formula

            $$
              \\mathbf{V}_1 \\times \\mathbf{V}_2 =
                \\begin{vmatrix}
                \\mathbf{i} &amp; \\mathbf{j} &amp; \\mathbf{k} \\\\
                \\frac{\\partial X}{\\partial u} &amp; \\frac{\\partial Y}{\\partial u} &amp; 0 \\\\
                \\frac{\\partial X}{\\partial v} &amp; \\frac{\\partial Y}{\\partial v} &amp; 0 \\\\
                \\end{vmatrix}
            $$

            ```
            $$
              \\mathbf{V}_1 \\times \\mathbf{V}_2 =
                \\begin{vmatrix}
                \\mathbf{i} &amp; \\mathbf{j} &amp; \\mathbf{k} \\\\
                \\frac{\\partial X}{\\partial u} &amp; \\frac{\\partial Y}{\\partial u} &amp; 0 \\\\
                \\frac{\\partial X}{\\partial v} &amp; \\frac{\\partial Y}{\\partial v} &amp; 0 \\\\
                \\end{vmatrix}
            $$
            ```

            ## An Identity of Ramanujan

            $$
                \\frac{1}{(\\sqrt{\\phi \\sqrt{5}}-\\phi) e^{\\frac25 \\pi}} =
                  1+\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {1+\\frac{e^{-6\\pi}}
                  {1+\\frac{e^{-8\\pi}} {1+\\ldots} } } }
            $$

            ```
            $$
                \\frac{1}{(\\sqrt{\\phi \\sqrt{5}}-\\phi) e^{\\frac25 \\pi}} =
                  1+\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {1+\\frac{e^{-6\\pi}}
                  {1+\\frac{e^{-8\\pi}} {1+\\ldots} } } }
            $$
            ```

            ## A Rogers-Ramanujan Identity

            $$
              1 +  \\frac{q^2}{(1-q)}+\\frac{q^6}{(1-q)(1-q^2)}+\\cdots =
                \\prod_{j=0}^{\\infty}\\frac{1}{(1-q^{5j+2})(1-q^{5j+3})},
                  \\quad\\quad \\text{for $|q| &lt; 1$}.
            $$

            ```
            $$
              1 +  \\frac{q^2}{(1-q)}+\\frac{q^6}{(1-q)(1-q^2)}+\\cdots =
                \\prod_{j=0}^{\\infty}\\frac{1}{(1-q^{5j+2})(1-q^{5j+3})},
                  \\quad\\quad \\text{for $|q| &lt; 1$}.
            $$
            ```

            ## Maxwell's Equations

            $$
            \\begin{align}
              \\nabla \\times \\vec{\\mathbf{B}} -\\,
              \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} &amp; = \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\\\
              \\nabla \\cdot \\vec{\\mathbf{E}} &amp; = 4 \\pi \\rho \\\\
              \\nabla \\times \\vec{\\mathbf{E}}\\, +\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{B}}}{\\partial t} &amp; = \\vec{\\mathbf{0}} \\\\
              \\nabla \\cdot \\vec{\\mathbf{B}} &amp; = 0
            \\end{align}
            $$


            ```
            \\begin{align}
              \\nabla \\times \\vec{\\mathbf{B}} -\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} &amp; = \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\\\
              \\nabla \\cdot \\vec{\\mathbf{E}} &amp; = 4 \\pi \\rho \\\\
              \\nabla \\times \\vec{\\mathbf{E}}\\, +\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{B}}}{\\partial t} &amp; = \\vec{\\mathbf{0}} \\\\
              \\nabla \\cdot \\vec{\\mathbf{B}} &amp; = 0
            \\end{align}
            ```

            ## Trig

            `$\\sin$` --> $\\sin$
            `$\\cos$` --> $\\cos$
            `$\\tan$` --> $\\tan$


            ###Inverse trig

            `$\\sin^{-1}$` --> $\\sin^{-1}$
            `$\\cos^{-1}$` --> $\\cos^{-1}$
            `$\\tan^{-1}$` --> $\\tan^{-1}$


            ### Logarithmic
            `$\\ln$` --> $\\ln$
            `$\\log$` --> $\\log$
            `$\\log_2$` --> $\\log_2$
            `$\\log_{10}$` --> $\\log_{10}$


            ### Hyperbolic trig

            `$\\sinh$` --> $\\sinh$
            `$\\cosh$` --> $\\cosh$
            `$\\tanh$` --> $\\tanh$
            `$\\coth$` --> $\\coth$

            ### Inverse hyperbolic trig

            `$\\sinh^{-1}$` --> $\\sinh^{-1}$
            `$\\cosh^{-1}$` --> $\\cosh^{-1}$
            `$\\tanh^{-1}$` --> $\\tanh^{-1}$
            `$\\coth^{-1}$` --> $\\coth^{-1}$

            ## Matrices

            $$
            \\begin{array}{|c|c|c|c|}
            \\hline 1 & 2 & 3 & 4 \\\\
            \\hline a & b & c & d \\\\
            \\hline x & y & z & w \\\\
            \\hline
            \\end{array}
            $$

            ```
            \\begin{array}{|c|c|c|c|}
            \\hline 1 & 2 & 3 & 4 \\\\
            \\hline a & b & c & d \\\\
            \\hline x & y & z & w \\\\
            \\hline
            \\end{array}
            ```

            $$
            \\begin{pmatrix} 1 & 2 & 3 & 4 \\\\
            a & b & c & d \\\\
            x & y & z & w
            \\end{pmatrix}
            $$

            ```
            $$\\begin{pmatrix} 1 & 2 & 3 & 4 \\\\ a & b & c & d
            \\\\ x & y & z & w \\end{pmatrix}$$
            ```

            ## Cases

            $$
              V(x) = \\begin{cases} 0, & x \\lt 0 \\\\ V_0, & 0 \\leq x \\lt L \\\\ 0, & x \\geq L \\end{cases}$$
            $$

            ```
            $$
              V(x) = \\begin{cases} 0, & x \\lt 0 \\\\ V_0, & 0 \\leq x \\lt L \\\\ 0, & x \\geq L \\end{cases}
            $$
            ```
          EOF
      end

      sig { returns(String) }
      def ui_redressing
        <<~EOF
          ### Image injection
          $$
          \\style{background-image:url("//i.imgur.com/nUwut25.jpeg");}{a}
          $$

          ### Cat wallpaper takes over the entire screen
          $$
          \\class{\\<style>* { display: none; } body, html { display: block !important; width:50%; height:50%; background: url(//raw.githubusercontent.com/cxcorp/test-2/main/cheezburger.jpg?token=GHSAT0AAAAAABPFR4MS6GAEVHASBFYWGSFUYUHVT5Q);}</style>}{a}
          $$

          ### Invisible anchor attack
          $$
          \\style{opacity:0;cursor:default;}{\href{//example.com/pwned}{\\style{position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;}{\\text{a}}}}
          $$

          ### Fake github modal

          $$
          \\style{position:fixed;top:0;left:0;right:0;bottom:0;position:relative;box-shadow:0 0 500px 500px rgba(0,0,0,0.5);z-index:9999;}{
          \\begin{align}
          \\style{height:129px;font-family:sans-serif;}{\
          \\class{Box Box--overlay d-flex flex-column anim-fade-in fast}{\
          \\begin{align}
          \\style{position:absolute;left:0;right:0;}{\\class{Box-header Box-title markdown-body}{\\text{Account security compromised}}} \\
          \\style{position:absolute;left:0;right:0;top:24px;margin: 50px;}{\\class{markdown-body}{\\text{\\href{\\#}{\\class{btn-primary btn}{Review security details}}}}} \\
          \\end{align}
          }
          }
          \\end{align}
          }
          $$

          ### Fake stargazer
          $$
          \\style{position:fixed;right:60px;top:81px;background-color:#30363d;z-index:9999;}{\\class{btn-sm Counter}{909}}
          $$

          ### Real Math - This should render correctly!

          $\sqrt{3}$

          $$
          \\begin{align}
          \\dot{x} &amp; = \\sigma(y-x) \\\\
          \\dot{y} &amp; = \\rho x - y - xz \\\\
          \\dot{z} &amp; = -\\beta z + xy
          \\end{align}
          $$

          ### \def macro function override
          $\\( \\def\\sum_{{\\bf R}} \\def\\bold#1{{\\bf #1}} \\)$

          $\\sum{10+5}$

          ### Fake comment link
          $$
            \\class{\\<style>#issuecomment-1133155966 .comment-body > * {display: none;} #issuecomment-1133155966 .comment-body::after {display: block;content: 'Vim is the best editor by far!'}</style>}{a}
          $$
        EOF
      end
    end
  end
end
