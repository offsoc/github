local vstruct = require "vstruct"

-- cache bitops
local bor,band,bnot,bxor,rol,tohex = bit.bor,bit.band,bit.bnot,bit.bxor,bit.rol,bit.lshift,bit.tohex

-- S specifies the per-round shift amounts
local S = {
  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,
}

-- Use binary integer part of the sines of integers (Radians) as constants:
local K = {
  0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
  0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
  0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
  0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
  0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
  0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
  0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
  0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
  0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
  0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
  0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
  0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
  0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
  0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
  0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
  0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
}

-- Initialize variables:
local A0 = 0x67452301   -- A
local B0 = 0xefcdab89   -- B
local C0 = 0x98badcfe   -- C
local D0 = 0x10325476   -- D

-- route_hash() returns a short hash of `data`, suitable for use
-- in building file paths for pages. This is used so that
-- we don't have directories with huge amounts of subdirectories,
-- but spread them out across a deeper tree with less subdirectories
-- per tree.
--
-- Only the first 32 bytes are used in the input here. This function
-- is in no way suited nor usable for any security sensitive operation.
-- All it is intended for is to build deeper directory trees.
local function route_hash(data)
  -- Lua operates on bytes, not characters, so we can just take
  -- the 32 byte substring here.
  data = data:sub(1, 32)
  orig_size = data:len()

  -- Pre-processing: adding a single 1 bit
  -- append "1" bit to data
  data = data .. string.char(0x80)

  -- Pre-processing: padding with zeros
  local padding_required = (56 - (data:len() % 64)) % 64
  data = data .. string.rep(string.char(0), padding_required)

  -- append original length in bits mod 2^64 to data
  local data = data .. vstruct.write("< u8", {orig_size*8})

  if not (data:len() == 64) then
    -- we messed up somewhere. exit request
    ngx.log(ngx.ERR, "path did not calculate correctly")
    return ngx.ERR(ngx.HTTP_BAD_REQUEST)
  end

  -- Process the data in successive 512-bit chunks:
  -- This is signed, because lua bitwise operations are signed
  local m = vstruct.read("16*i4", data)  -- sixteen 32-bit words

  -- Initialize hash value
  a, b, c, d = A0, B0, C0, D0

  -- Main loop.
  for i = 0, 63 do
    if i < 16 then
      f = band(
            bor(
              band(b, c),
              band(
                bnot(b), d
              )
            ),
            0xffffffff
          )
      g = i
    elseif i < 32 then
      f = band(
        bor(
          band(d, b),
          band(bnot(d), c)
        ),
        0xffffffff
      )
      g = (5*i + 1) % 16
    elseif i < 48 then
      f = band(
        bxor(b, c, d),
        0xffffffff
      )
      g = (3*i + 5) % 16
    else
      f = band(
        bxor(
          c,
          bor(b, (
            bnot(d)
          )
        )),
        0xffffffff
      )
      g = (7*i) % 16
    end

    -- Be wary of the below definitions of a,b,c,d
    -- Lua indexes start at 1
    f = band((f + a + K[i+1] + m[g+1]), 0xffffffff)  -- M[g] must be a 32-bits block
    a = d
    d = c
    c = b
    -- Lua indexes start at 1
    b = band((b + rol(f, S[i+1])), 0xffffffff)
  end
  --Add this chunk's hash to result so far:
  a = A0 + a

  -- Output is in little-endian and Lua bitwise ops are signed.
  digest = vstruct.write("< i4", {a})

  -- This need to be big endian and we get it unsigned out of it.
  vals = vstruct.read("> u4", digest)

  -- convert struct to hex values
  h = {}
  for i=1,#vals do
    h[i] = bit.tohex(vals[i])
  end
  -- returns first hex value
  return h[1]
end

return route_hash
