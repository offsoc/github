/**
 * We have an Azure Service Principle configured for nx caching. In order to use these credentials, we need to
 * pass them into nx-remotecache-azure. Unfortunately the best way to do this is to set them as environment variables.
 * The variable names are fairly generic, so we don't want to set them globally in ci/actions/codespaces. Instead, we
 * use a more specific env variable name and then set the generic ones here.
 */
const remoteCacheAzure = require('nx-remotecache-azure')

Object.assign(process.env, {
  AZURE_TENANT_ID: process.env.SPN_FRONTEND_SYSTEMS_TENANT_ID,
  AZURE_CLIENT_ID: process.env.SPN_FRONTEND_SYSTEMS_CLIENT_ID,
  AZURE_CLIENT_SECRET: process.env.SPN_FRONTEND_SYSTEMS,
})

module.exports = remoteCacheAzure
