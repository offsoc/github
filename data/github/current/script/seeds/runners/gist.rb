# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Gist < Seeds::Runner
      def self.help
        <<~HELP
        Setup some baseline Gists for testing.
        HELP
      end

      def self.run(options = {})
        new.run
      end

      def run
        setup_comment_gist
        setup_math_gist
      end

      private

      def setup_comment_gist
        puts "Creating Gist with lots of comments"
        gist = Seeds::Objects::Gist.create(user: Objects::User.monalisa, contents: [{ name: "README.md", value: "This is a comment gist" }])
        GitHub::RateLimitedCreation.disable_content_creation_rate_limits do
          200.times do |i|
            Seeds::Objects::GistComment.create(user: Objects::User.monalisa, gist: gist, body: "Comment #{i}")
          end
        end

      end

      def setup_math_gist
        puts "Creating Gist with math"
        gist = Seeds::Objects::Gist.create(
          user: Objects::User.monalisa,
          contents: [{ name: "mathjax.md",
            value:  math_body_full
        }])
      end

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

            \\begin{align}
              \\nabla \\times \\vec{\\mathbf{B}} -\\,
              \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} &amp; = \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\\\
              \\nabla \\cdot \\vec{\\mathbf{E}} &amp; = 4 \\pi \\rho \\\\
              \\nabla \\times \\vec{\\mathbf{E}}\\, +\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{B}}}{\\partial t} &amp; = \\vec{\\mathbf{0}} \\\\
              \\nabla \\cdot \\vec{\\mathbf{B}} &amp; = 0
            \\end{align}


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

            \\begin{array}{|c|c|c|c|}
            \\hline 1 & 2 & 3 & 4 \\\\
            \\hline a & b & c & d \\\\
            \\hline x & y & z & w \\\\
            \\hline
            \\end{array}

            ```
            \\begin{array}{|c|c|c|c|}
            \\hline 1 & 2 & 3 & 4 \\\\
            \\hline a & b & c & d \\\\
            \\hline x & y & z & w \\\\
            \\hline
            \\end{array}
            ```

            $$\\begin{pmatrix} 1 & 2 & 3 & 4 \\\\ a & b & c & d
            \\\\ x & y & z & w \\end{pmatrix}$$

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
    end
  end
end
