# frozen_string_literal: true
module SlackMock
  class ReminderMessage
    def self.deliver(data)
      new(data).deliver
    end

    attr_reader :actor, :data, :event_type
    def initialize(data)
      @data = data
      @event_type = data.dig("context", "event")
      @actor = "@#{data.dig("sender", "login")}"
    end

    def deliver
      if data["action"] == "scheduled"
        channel = data.dig("reminder", "channel_id")

        data["pull_requests"].each do |pull_request_data|
          pull_request = PullRequest.new(pull_request_data)
          self.class.notify("#{pull_request.title} by #{pull_request.author}", title: "Scheduled reminder to ##{channel}", subtitle: pull_request.repo)
        end
      else
        if personal?
          deliver_real_time_dm
        else
          deliver_real_time
        end
      end
    end

    def personal?
      data["reminder"].key?("recipient")
    end

    class PullRequest
      attr_reader :author, :repo, :title
      def initialize(pull_request_data)
        pull_request_data ||= {}

        @author = pull_request_data.dig("user", "login")
        @repo = pull_request_data.dig("head", "repo", "full_name")
        @title = "[##{pull_request_data["number"]}] #{pull_request_data["title"]}"
      end
    end

    def pull_request
      @pull_request ||= PullRequest.new(data.dig("pull_requests", 0))
    end

    def deliver_real_time
      recipient = "##{data.dig("reminder", "channel_id")}"

      case event_type
      when "pull_request_merged"
        body = "#{actor} merged #{pull_request.title}"
        self.class.notify(body, title: "Real-time to #{recipient}", subtitle: pull_request.repo)
      else
        raise "Unknown event type: #{event_type}"
      end
    end

    def deliver_real_time_dm
      recipient = "@#{data.dig("reminder", "recipient", "login")}"

      case event_type
      when "assignment"
        assignee_id = data.dig("context", "assignee_id")
        assignee = User.find_by(id: assignee_id)&.login || assignee_id
        self.class.notify("#{actor} assigned you to #{pull_request.title}", title: "Real-time to @#{assignee}", subtitle: pull_request.repo)
      when "review_request"
        assignee_id = data.dig("context", "requested_id")
        assignee = User.find_by(id: assignee_id)&.login || assignee_id
        self.class.notify("#{actor} requested your review on #{pull_request.title}", title: "Real-time to @#{assignee}", subtitle: pull_request.repo)
      when "team_review_request"
        self.class.notify("#{actor} requested your team's review on #{pull_request.title}", title: "Real-time to #{recipient}", subtitle: pull_request.repo)
      when "review_submission"
        review_state = data.dig("context", "review_state")
        verb = {
          "approved" => "approved",
          "changes_requested" => "requested changes on"
        }.fetch(review_state)

        self.class.notify("@#{actor} #{verb} #{pull_request.title}", title: "Real-time to #{recipient}", subtitle: pull_request.repo)
      when "pull_request_merged"
        body = "@#{actor} merged your PR #{pull_request.title}"
        self.class.notify(body, title: "Real-time to #{recipient}", subtitle: pull_request.repo)
      when "comment"
        body = data.dig("context", "comment_body")
        subtitle = "@#{actor} comment on your PR #{pull_request.title}"
        self.class.notify(body, title: "Real-time to #{recipient}", subtitle: subtitle)
      when "comment_reply"
        body = data.dig("context", "comment_body")
        subtitle = "@#{actor} replied to you in #{pull_request.title}"
        self.class.notify(body, title: "Real-time to #{recipient}", subtitle: subtitle)
      when "mention"
        body = data.dig("context", "comment_body")
        subtitle = "@#{actor} mentioned you in #{pull_request.title}"
        self.class.notify(body, title: "Real-time to #{recipient}", subtitle: subtitle)
      when "merge_conflict"
        conflicting_files = data.dig("context", "conflicting_files")
        body = "Merge conflict on #{conflicting_files.join(", ")}"
        self.class.notify(body, title: "Real-time to @#{recipient}", subtitle: pull_request.title)
      else
        raise "Unknown event type: #{event_type}"
      end
    end

    def self.notify(message, title: nil, subtitle: nil)
      message ||= "<no message>"
      apple_script = "display notification #{message.inspect}"
      apple_script += "with title #{title.inspect}" if title
      apple_script += "subtitle #{subtitle.inspect}" if subtitle

      system("osascript", "-e", apple_script)
    end
  end
end
