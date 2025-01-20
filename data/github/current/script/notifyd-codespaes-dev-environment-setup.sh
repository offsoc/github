#!/bin/bash
set -e

helpFunction()
{
   echo ""
   echo "Usage: $0 -b initial-notifyd-branch"
   echo -e "\t-b Initial notifyd branch"
   echo -e "\t-h Print this help message"
   exit 1 # Exit script after printing help
}

while getopts "b:h:" opt
do
   case "$opt" in
      b ) NOTIFYD_BRANCH="$OPTARG" ;;
      h ) helpFunction ;; # Print helpFunction
      ? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
   esac
done

# Print helpFunction in case parameters are empty
if [ -z "$NOTIFYD_BRANCH" ]
then
   echo "Missing required parameters";
   helpFunction
fi

cd /workspaces/github

if [ ! -d $(go env GOPATH)/src/github.com/github/notifyd ]; then
    # Setup notifyd
  mkdir -p $(go env GOPATH)/src/github.com
  mkdir -p $(go env GOPATH)/src/github.com/github/
  cd $(go env GOPATH)/src/github.com/github
  git clone git@github.com:github/notifyd.git
fi

cd $(go env GOPATH)/src/github.com/github/notifyd

git checkout "$NOTIFYD_BRANCH"

NOTIFYD_PROJECT_PATH=$(pwd)
echo "Installed Notifyd in $NOTIFYD_PROJECT_PATH"

if [ ! -d ./logs ]; then
  mkdir logs
fi

echo "Setting up env variables"

# We need those variables to be exported
cat .dotcom-codespaces-env >> ~/.bashrc
source ~/.bashrc

echo "Creating DB"
./script/bootstrap

echo "Migrate DB"
APP_ENV=development script/migrate-mysql && APP_ENV=test script/migrate-mysql

cd /workspaces/github

echo "Enable feature flags"
bin/toggle-feature-flag enable publish_events_to_notifyd
bin/toggle-feature-flag enable notifyd_issue_notify
bin/toggle-feature-flag enable notifyd_issue_comment_notify
bin/toggle-feature-flag enable notifyd_pull_request_review_notify

echo "SETUP COMPLETED!"
echo -e "\n"
echo "Now start apps in separate bash windows"

echo -e "Start Dotcom: \n ./bin/server --debug"
echo -e "Start Notifyd consumer \n cd $(go env GOPATH)/src/github.com/github/notifyd && APP_ENV=development go run ./cmd/notify-consumer"
echo -e "Start Delivery PN consumer: \n cd $(go env GOPATH)/src/github.com/github/notifyd && APP_ENV=development go run ./cmd/deliver-mobile-push-consumer"
echo -e "Start twirp API: \n cd $(go env GOPATH)/src/github.com/github/notifyd && APP_ENV=development go run ./cmd/api"
