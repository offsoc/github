set -e

export GH_ELASTICSEARCH_PORT=9400
echo "GH_ELASTICSEARCH_PORT=9400"

cmd="sudo supervisorctl restart elasticsearch8"
echo "Starting ES8 with \`$cmd\`..."
eval $cmd

echo "Waiting for ES8 to start at http://localhost:$GH_ELASTICSEARCH_PORT..."
until $(curl --output /dev/null --silent --head --fail http://localhost:$GH_ELASTICSEARCH_PORT); do
    printf '.'
    sleep 1
done
echo -e "Done."

cmd="GH_ELASTICSEARCH_PORT=$GH_ELASTICSEARCH_PORT bin/elastomer bootstrap"
echo "Bootstrapping ES8 index with: \`$cmd\`..."
eval $cmd
echo "Done."

# Check if the script was sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo -e "\nNOTE: Since this script was executed and not sourced, you will need to make sure GH_ELASTICSEARCH_PORT=$GH_ELASTICSEARCH_PORT is set in your environment before running additional commands."
else
  echo -e "\nGH_ELASTICSEARCH_PORT=$GH_ELASTICSEARCH_PORT is now set in this shell (but will need to be set again in new shells)."
fi

echo -e "\nNext steps: \n"
echo -e "\t1. Run \`script/server\`"
echo -e "\t2. Wait until the UI is working."
echo -e "\t3. Run \`GH_ELASTICSEARCH_PORT=$GH_ELASTICSEARCH_PORT bin/projects-denormalization-processor\` in a new shell tab if you want the denormalization pipeline to run."
echo -e "\nTo seed the index with some data, create a project with some items in it and then run the following from a shell:"
echo -e "\n\t GH_ELASTICSEARCH_PORT=$GH_ELASTICSEARCH_PORT bin/elastomer repair"
echo -e "\n"
