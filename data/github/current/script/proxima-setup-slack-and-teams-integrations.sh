#!/bin/bash
set -e

helpFunction()
{
   echo ""
   echo "Usage:"
   echo -e "\t-a Application to seed: slack or teams"
   echo -e "\t-u Application URL that will be used for callbacks and webhooks, for ex. https://slack.staffship.ghe.com"
   echo -e "\t-s Proxima stamp, for ex. mtwesteu01"
   echo -e "\t-h Print this help message"
   exit 1 # Exit script after printing help
}

while [[ $# -gt 0 ]]; do
  case $1 in
    -a|--app)
      app="$2"
      shift # past argument
      shift # past value
      ;;
    -s|--stamp)
      stamp="$2"
      shift # past argument
      shift # past value
      ;;
    -u|--app_url)
      app_url="$2"
      shift # past argument
      shift # past value
      ;;
    -h|--help)
      helpFunction
      ;;
    -*|--*)
      echo "Unknown option $1"
      exit 1
      ;;
    *)
      POSITIONAL_ARGS+=("$1") # save positional arg
      shift # past argument
      ;;
  esac
done


if [ -z "$app" ] || [ -z "$app_url" ] || [ -z "$stamp" ]
then
   echo "Missing required parameters";
   helpFunction
fi

output_dir="/tmp/$app-app-keys"
mkdir -p $output_dir

app_private_key_path="$output_dir/private-key.pem"
app_public_key_path="$output_dir/public-key.pem"

openssl req -new -newkey rsa:2048 -days 3650 -nodes -x509 -sha256 -subj "/CN=github_$stamp" -keyout $app_private_key_path
openssl rsa -in $app_private_key_path -pubout -out $app_public_key_path

echo "Keys have been saved to $output_dir. Please remove this directory after saving keys to vault."

current_dir=$(dirname $0)

client_secret="$(openssl rand -hex 20)"
echo -e "Client secret: $client_secret"

client_id="Iv1.$(openssl rand -hex 8)"
echo -e "Client id: $client_id"

if [ "$app" != "unfurl" ]
then
  webhook_secret="$(openssl rand -hex 32)"
  echo -e "Webhook secret: $webhook_secret"

  callback_url="$app_url/$app/github/oauth/callback"
  webhook_url="$app_url/github/events"
  $current_dir/../bin/rake --trace "proxima:chatops:create_$app[$app_url/,$webhook_url,$callback_url,$webhook_secret,$client_id,$client_secret,$app_public_key_path]"
else
  $current_dir/../bin/rake --trace "proxima:chatops:create_unfurl[$app_url/,$client_id,$client_secret,$app_public_key_path]"
fi




