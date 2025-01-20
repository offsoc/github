# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class PullRequestSyntaxHighlighting < Seeds::Runner
      DEFAULT_USER_NAME = "monalisa"
      DEFAULT_REPO_NAME = "smile"
      DEFAULT_NWO = "#{DEFAULT_USER_NAME}/#{DEFAULT_REPO_NAME}"

      LANGUAGE_EXTENSION_HASH = {
        "Ruby" => "rb",
        "JavaScript" => "js",
        "Go" => "go",
        "YAML" => "yml",
        "Markdown" => "md",
      }.freeze

      def self.help
        <<~HELP
        Create a pull request with changed files in many different languages, suitable for testing syntax highlighting.

        - Ensures given PR author exists (defaults to "#{DEFAULT_USER_NAME}")
        - Ensures given repo exists (defaults to "#{DEFAULT_NWO}")
        - Creates pull request with files changed in the following languages: #{LANGUAGE_EXTENSION_HASH.keys.join(", ")}

        Options:
          -author, -u
           String name of the pull request author. Defaults to "#{DEFAULT_USER_NAME}".

          -nwo, -r
           String "name with owner" of the pull request base repository. Defaults to "#{DEFAULT_NWO}".
        HELP
      end

      def self.run(options = {})
        new.run(options)
      end

      def run(options)
        author_login = options[:author] || DEFAULT_USER_NAME
        puts "Finding or creating PR author #{author_login}..."
        author = Seeds::Objects::User.create(login: author_login)

        nwo = options[:nwo] || "#{author_login}/#{DEFAULT_REPO_NAME}"
        puts "Finding or creating repo #{nwo}..."
        repo = Seeds::Objects::Repository.create_with_nwo(nwo: nwo, setup_master: true)

        unless repo.members.include?(author)
          puts "Adding author to repo as member with write permissions..."
          repo.add_member(author)
        end

        puts "Adding initial files to repo..."
        files = \
          LANGUAGE_EXTENSION_HASH.each.with_object({}) do |(language, extension), memo|
            memo["example.#{extension}"] = send("#{language.downcase}_file_content")
          end

        base_commit = \
          Seeds::Objects::Commit.create(
            repo: repo,
            committer: author,
            message: "Initial commit",
            files: files
          )

        puts "Committing changes to files in new branch..."
        head_ref_name = "branch-#{SecureRandom.hex}"
        head_ref = repo.refs.create("refs/heads/#{head_ref_name}", base_commit.oid, author)
        metadata = { message: "Making changes", committer: author, author: author }
        head_ref.append_commit(metadata, author) do |changes|
          files.each do |filepath, content|
            changes.add(filepath, make_random_changes(content))
          end
        end

        puts "Creating pull request..."
        ::PullRequest.create_for!(
          repo,
          user: author,
          title: "Pull request with many different languages",
          body: "This pull request contains files changed in #{LANGUAGE_EXTENSION_HASH.keys.join(", ")} languages.",
          head: head_ref_name,
          base: repo.default_branch,
        )

        puts "Done!"
      end

      # Modifies given string by replacing every instance of 1 alphabetic character
      # with another randomly chosen alphabetic charater.
      #
      # content - String with at least 2 alphabetic characters
      #
      # Returns String
      def make_random_changes(content)
        alphabetic_characters = content.dup.gsub(/\d|\s|\W/, "").chars.uniq.shuffle
        character_to_replace, replacement_character = alphabetic_characters.pop(2)
        content.gsub(character_to_replace, replacement_character)
      end

      # Source: https://github.com/rails/rails/blob/main/activerecord/examples/simple.rb
      def ruby_file_content
        <<~CONTENT
          # frozen_string_literal: true

          require "active_record"

          class Person < ActiveRecord::Base
            establish_connection adapter: "sqlite3", database: "foobar.db"
            connection.create_table table_name, force: true do |t|
              t.string :name
            end
          end

          bob = Person.create!(name: "bob")
          puts Person.all.inspect
          bob.destroy
          puts Person.all.inspect
        CONTENT
      end

      # Source: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/What_is_JavaScript#comments
      def javascript_file_content
        <<~CONTENT
        // Function: creates a new paragraph and appends it to the bottom of the HTML body.

        function createParagraph() {
          const para = document.createElement('p');
          para.textContent = 'You clicked the button!';
          document.body.appendChild(para);
        }

        /*
          1. Get references to all the buttons on the page in an array format.
          2. Loop through all the buttons and add a click event listener to each one.

          When any button is pressed, the createParagraph() function will be run.
        */

        const buttons = document.querySelectorAll('button');

        for (const button of buttons) {
          button.addEventListener('click', createParagraph);
        }
        CONTENT
      end

      # Source: https://gobyexample.com/writing-files
      def go_file_content
        <<~CONTENT
        package main

        import (
            "bufio"
            "fmt"
            "os"
        )

        func check(e error) {
            if e != nil {
                panic(e)
            }
        }

        func main() {

            d1 := []byte("hello\ngo\n")
            err := os.WriteFile("/tmp/dat1", d1, 0644)
            check(err)

            f, err := os.Create("/tmp/dat2")
            check(err)

            defer f.Close()

            d2 := []byte{115, 111, 109, 101, 10}
            n2, err := f.Write(d2)
            check(err)
            fmt.Printf("wrote %d bytes\n", n2)

            n3, err := f.WriteString("writes\n")
            check(err)
            fmt.Printf("wrote %d bytes\n", n3)

            f.Sync()

            w := bufio.NewWriter(f)
            n4, err := w.WriteString("buffered\n")
            check(err)
            fmt.Printf("wrote %d bytes\n", n4)

            w.Flush()

        }
        CONTENT
      end

      # Source: https://github.com/mattcone/markdown-guide
      def markdown_file_content
        <<~CONTENT
        # Markdown Guide

        *[The Markdown Guide](https://www.markdownguide.org)* is a comprehensive Markdown reference designed for both novices and experts. It was born out of frustration with existing Markdown references that are incomplete and inadequate.

        ## Contributing

        Contributions are welcome. Feel free to open a pull request with changes.

        ### Running it Locally

        It can be helpful to preview changes on your computer before opening a pull request. *The Markdown Guide* uses the [Jekyll static site generator](http://jekyllrb.com/). After forking or cloning the repository, perform the following steps to generate the site and preview it:

        - Make sure you have ruby installed on your computer. See https://www.ruby-lang.org/en/downloads/
        - `bundle install`
        - `bundle exec jekyll serve`
        - Point your browser at http://127.0.0.1:4000/

        ### Adding tools

        See [this page](https://github.com/mattcone/markdown-guide/wiki/Markdown-tool-directory) for information about adding applications to the [Markdown tools directory](https://www.markdownguide.org/tools/).

        ## Deployment

        Pull requests merged to the master branch are automatically deployed to the production website.

        ## License

        The content of this project itself is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International license](https://creativecommons.org/licenses/by-sa/4.0/), and the underlying source code used to format and display that content is licensed under the [MIT license](LICENSE.txt).
        CONTENT
      end

      # Source: https://yaml.org/spec/1.2.2/#25-full-length-example
      def yaml_file_content
        <<~CONTENT
          ---
          Time: 2001-11-23 15:01:42 -5
          User: ed
          Warning:
            This is an error message
            for the log file
          ---
          Time: 2001-11-23 15:02:31 -5
          User: ed
          Warning:
            A slightly different error
            message.
          ---
          Date: 2001-11-23 15:03:17 -5
          User: ed
          Fatal:
            Unknown variable "bar"
          Stack:
          - file: TopClass.py
            line: 23
            code: |
              x = MoreObject("345\n")
          - file: MoreClass.py
            line: 58
            code: |-
              foo = bar
        CONTENT
      end
    end
  end
end
