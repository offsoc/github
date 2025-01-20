-- Internal: Requests a Page build from the monolith. This is used as a part of the
-- lazy build functionality in cases where the system receives a request for a valid
-- Pages site whose deployment cannot be found and we need to build the page on demand.

local function dump(o)
  if type(o) == 'table' then
    local s = '{ '
    for k,v in pairs(o) do
      if type(k) ~= 'number' then k = '"'..k..'"' end
      s = s .. '['..k..'] = ' .. dump(v) .. ','
    end
    return s .. '} '
  else
    return tostring(o)
  end
end

local function init()
  -- If the app-config isn't properly setup, then we can't serve connections.
  -- Ensure we have a valid configuration before going any farther.
  if not config then
    ngx.log(ngx.ERR, "Config value is not set. Exiting.")
    return ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
  end
  if not string.match(package.path, "/data/pages%-lua/vendor/%?%.lua%;/data/pages%-lua/vendor/%?/init%.lua") then
    package.path = package.path .. ";/data/pages-lua/vendor/?.lua;/data/pages-lua/vendor/?/init.lua"
  end
end

local function github_api_url()
  local github_api = config.GITHUB_API_ADDR
  local url = github_api .. "/api/v3/internal/pages/build"
  ngx.log(ngx.ERR, "URL: " .. dump(url))

  return url
end

local function http_client()
  local http_client, err = require("lua-resty-http/lib/resty/http").new()

  return http_client, err
end

local function generate_hmac()
  local hmac = require("lua-resty-hmac/lib/resty/hmac")

  local hmac_sha256 = hmac:new(config.API_REQUEST_SECRET, hmac.ALGOS.SHA256)
  if not hmac_sha256 then
    return nil, "Unable to create resty.hmac instance"
  end

  -- Create a timestamp to add to the hmac signature
  local timestamp = tostring(math.floor(ngx.now()))
  if not timestamp then
    return nil, "Failed to create timestamp"
  end

  -- Add timestamp data to the hmac
  local final_hmac = hmac_sha256:final(timestamp, true)
  if not final_hmac then
    return nil, "Failed to create Request-HMAC value"
  end

  local hmac_header = timestamp .. "." .. final_hmac

  return hmac_header, nil
end

-- Attempt to claim a lock on a page build by page ID.
--
-- Requires that a lua_shared_dict NGINX directive be set:
-- Example:
-- lua_shared_dict builds 1m
--
-- Returns success, err tuple where success is true only if the attempt to lock was
-- successful. Otherwise success will be false and err will be set. In cases where
-- a lock could not be obtained because another was in progress err will be set to
-- "build_in_progress".
local function claim_page_build_lock(page_id, expiration_time)
  local build_in_progress = ngx.shared.builds:get(page_id)
  if build_in_progress ~= nil then
    ngx.log(ngx.ERR, "Build already in progress for Page ID: " .. page_id)
    return false, "build_in_progress"
  end

  success, err = ngx.shared.builds:add(page_id, 1, expiration_time)
  if not success then
    if err == "exists" then
      ngx.log(ngx.ERR, "Build already in progress for Page ID: " .. page_id)
      return false, "build_in_progress"
    else
      ngx.log(ngx.ERR, "Unable to claim a build lock for Page ID: " .. page_id .. " error: " .. err)
      return false, err
    end
  end

  ngx.log(ngx.ERR, "Claimed a build lock for Page ID: " .. page_id)
  return true, nil
end

local function request_page_build()
  local page_id = ngx.var.http_x_github_pages_page_id
  if not page_id then
    return nil, "Page ID not provided"
  end

  ngx.log(ngx.ERR, "Requesting lazy build for Page ID: " .. page_id)

  -- Set build lock to 5 minutes which matches the API side.
  local success, build_lock_err = claim_page_build_lock(page_id, 5 * 60)

  -- We'll allow other errors claiming a build lock to succeed in case there
  -- is some other error like low cache memory. The error will have been logged.
  if build_lock_err == "build_in_progress" then
    return nil, "build_in_progress"
  end

  local url = github_api_url()
  local http_client, err = http_client()

  if not err then
    local hmac, err = generate_hmac()
    if err then
      return nil, err
    end

    local response, err = http_client:request_uri(url, {
      method = "POST" ,
      headers = {
        ["Accept"] = "application/vnd.github.v3+json",
        ["Request-HMAC"] = hmac
      },
      body = '{"page_id": "' .. page_id .. '"}'
    })

    return response, err
  else
    return nil, err
  end

  -- Shouldn't get here
  return nil, "Unhandled error"
end

local function handle_request_page_build_response(response, err)
  if err == "build_in_progress" then
    return ngx.exit(ngx.HTTP_SERVICE_UNAVAILABLE)
  end

  if err == nil and response ~= nil then
    if response.status == 202 then
      ngx.log(ngx.ERR, "Lazy page build request success. HTTP Status: " .. response.status .. " Message: " .. dump(response.body))
      return ngx.exit(ngx.HTTP_SERVICE_UNAVAILABLE)
    else
      ngx.log(ngx.ERR, "Lazy page build request error. HTTP Status: " .. response.status .. " Message: " .. dump(response.body))
      return ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    end
  end

  ngx.log(ngx.ERR, "Lazy page build request error." .. dump(err))
  return ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

init()
handle_request_page_build_response(request_page_build())

