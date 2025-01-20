/**
 * Please keep this file import free, so it can easily be used in `scripts` to auto-download
 * user avatars
 *
 * Mock collaborator data.
 *
 * When making updates to this file, please run the image download script
 * to update avatars from gh.
 *
 * run `npm run download-images` to download a correctly sized avatar (48x48)
 *
 * Actual user names/etc aren't important here,
 * since we aren't hitting actual github APIs, but are helpful for
 * consistency with the real world
 *
 * * id fields should be github.com user ids. (a quick way to look this up is to go to the user's profile page and inspect the avatar url `https://avatars.githubusercontent.com/u/<id>`)
 * * login fields should be github.com user logins.
 * * name fields should be the user's name.
 * * avatarUrl fields should be based on the users avatar url from github.com
 */
export const teams = [
  {
    id: 3925116,
    slug: 'memex-team-1',
    name: 'Memex Team 1',
  },
  {
    id: 3967081,
    slug: 'memex-team-2',
    name: 'Memex Team 2',
  },
  {
    id: 3874770,
    slug: 'memex-team-3',
    name: 'Memex Team 3',
  },
].map(t => ({...t, avatarUrl: `/assets/avatars/t/${t.id}.png`}))

export const users = [
  {
    id: 3866405,
    global_relay_id: 'MDQ6VXNlcjM4NjY0MDU=',
    login: 'deborah-digges',
    name: 'Deborah Digges',
    isSpammy: false,
  },
  {
    id: 5487287,
    global_relay_id: 'MDQ6VXNlcjU0ODcyODc=',
    login: 'dmarcey',
    name: 'Derrick Marcey',
    isSpammy: false,
  },
  {
    id: 2294248,
    global_relay_id: 'MDQ6VXNlcjIyOTQyNDg=',
    login: 'iansan5653',
    name: 'Ian Sanders',
    isSpammy: false,
  },
  {
    id: 1714072,
    global_relay_id: 'MDQ6VXNlcjE3MTQwNzI=',
    login: 'olivia',
    name: 'Olivia',
    isSpammy: false,
  },
  {
    id: 776168,
    global_relay_id: 'MDQ6VXNlcjc3NjE2OA==',
    login: 'lerebear',
    name: null,
    isSpammy: false,
  },
  {
    id: 7034719,
    global_relay_id: 'MDQ6VXNlcjcwMzQ3MTk=',
    login: 'keisaacson',
    name: 'Kelsey Isaacson',
    isSpammy: false,
  },
  {
    id: 7559041,
    global_relay_id: 'MDQ6VXNlcjc1NTkwNDE=',
    login: 'katestud',
    name: 'Kate Studwell',
    isSpammy: false,
  },
  {
    id: 3104489,
    global_relay_id: 'MDQ6VXNlcjMxMDQ0ODk=',
    login: 'smockle',
    name: 'Clay Miller',
    isSpammy: false,
  },
  {
    id: 397836,
    global_relay_id: 'MDQ6VXNlcjM5NzgzNg==',
    login: 't-hugs',
    name: 'Trevor Gau',
    isSpammy: false,
  },
  {
    id: 5246869,
    global_relay_id: 'MDQ6VXNlcjUyNDY4Njk=',
    login: 'jayspadie',
    name: 'Jay Spadie',
    isSpammy: false,
  },
  {
    id: 732573,
    global_relay_id: 'MDQ6VXNlcjczMjU3Mw==',
    login: 'mattpage',
    name: 'Matt Page',
    isSpammy: false,
  },
  {
    id: 2006658,
    global_relay_id: 'MDQ6VXNlcjIwMDY2NTg=',
    login: 'maxbeizer',
    name: 'Max Beizer',
    isSpammy: false,
  },
  {
    id: 359239,
    global_relay_id: 'MDQ6VXNlcjM1OTIzOQ==',
    login: 'shiftkey',
    name: 'Brendan Forster',
    isSpammy: false,
  },
  {
    id: 8960591,
    global_relay_id: 'MDQ6VXNlcjg5NjA1OTE=',
    login: 'emplums',
    name: 'Emily Plummer',
    isSpammy: false,
  },
  {
    id: 1295166,
    global_relay_id: 'MDQ6VXNlcjEyOTUxNjY=',
    login: 'cmwinters',
    name: 'Caleb Winters',
    isSpammy: false,
  },
  {
    id: 526284,
    global_relay_id: 'MDQ6VXNlcjUyNjI4NA==',
    login: 'glortho',
    name: 'Jed Verity',
    isSpammy: false,
  },
  {
    id: 8616962,
    global_relay_id: 'MDQ6VXNlcjg2MTY5NjI=',
    login: 'mattcosta7',
    name: 'Matthew Costabile',
    isSpammy: false,
  },
  {
    id: 9959680,
    global_relay_id: 'MDQ6VXNlcjk5NTk2ODA=',
    login: 'traumverloren',
    name: 'Stephanie Nemeth',
    isSpammy: false,
  },
  {
    id: 64602043,
    global_relay_id: 'MDQ6VXNlcjY0NjAyMDQz',
    login: 'iulia-b',
    name: 'Iulia Bejan',
    isSpammy: false,
  },
  {
    id: 6519974,
    global_relay_id: 'MDQ6VXNlcjY1MTk5NzQ=',
    login: 'stephenotalora',
    name: 'Jonathan Otalora',
    isSpammy: false,
  },
  {
    id: 4308048,
    global_relay_id: 'MDQ6VXNlcjQzMDgwNDg=',
    login: 'tylerdixon',
    name: 'Tyler Dixon',
    isSpammy: false,
  },
  {
    id: 6740550,
    global_relay_id: 'MDQ6VXNlcjY3NDA1NTA=',
    login: 'talune',
    name: 'Tara Nelson',
    isSpammy: false,
  },
  {
    id: 1514176,
    global_relay_id: 'MDQ6VXNlcjE1MTQxNzY=',
    login: 'camchenry',
    name: 'Cameron McHenry',
    isSpammy: false,
  },
  {
    id: 5373900,
    global_relay_id: 'MDQ6VXNlcjUzNzM5MDA=',
    login: 'marywhite',
    name: 'Mary White',
    isSpammy: false,
  },
  {
    id: 7584089,
    global_relay_id: 'MDQ6VXNlcjc1ODQwODk=',
    login: 'azenMatt',
    name: 'Matthew Butler',
    isSpammy: false,
  },
  {
    id: 0,
    global_relay_id: 'MDQ6VXNlcjA=',
    login: 'limitedaccessuser',
    name: 'Limited Access User',
    isSpammy: false,
  },
  {
    id: 11159684,
    global_relay_id: 'MDQ6VXNlcjExMTU5Njg0',
    login: 'lisakr',
    name: 'Lisa',
    isSpammy: false,
  },
  {
    id: 13259331,
    global_relay_id: 'MDQ6VXNlcjEzMjU5MzMx',
    login: 'reneexeener',
    name: 'Renee',
    isSpammy: false,
  },
  {
    id: 5460483,
    global_relay_id: 'MDQ6VXNlcjU0NjA0ODM=',
    login: 'bigdadbear',
    name: 'Aaron',
    isSpammy: false,
  },
  {
    id: 6415144,
    global_relay_id: 'MDQ6VXNlcjY0MTUxNDQ=',
    login: 'abigailychen',
    name: 'Abigail Chen',
    isSpammy: false,
  },
  {
    id: 13342219,
    global_relay_id: 'MDQ6VXNlcjEzMzQyMjE5',
    login: 'stephanieg0',
    name: 'Stephanie Goldstein',
    isSpammy: false,
  },
  {
    id: 677570,
    global_relay_id: 'MDQ6VXNlcjY3NzU3MA==',
    login: 'abstrctn',
    name: 'Michael Strickland',
    isSpammy: false,
  },
  {
    id: 49918839,
    global_relay_id: 'MDQ6VXNlcjQ5OTE4ODM5',
    login: 'UnicodeRogue',
    name: 'UnicodeRogue',
    isSpammy: false,
  },
  {
    id: 821435,
    global_relay_id: 'MDQ6VXNlcjgyMTQzNQ==',
    login: 'mikesurowiec',
    name: 'Mike Surowiec',
    isSpammy: false,
  },
  {
    id: 44318181,
    global_relay_id: 'MDQ6VXNlcjQ0MzE4MTgx',
    login: 'abdelhamid-attaby',
    name: 'abdelhamid-attaby',
    isSpammy: false,
  },
  {
    id: 2546,
    global_relay_id: 'MDQ6VXNlcjI1NDY=',
    login: 'skalnik',
    name: 'Mike Skalnik',
    isSpammy: false,
  },
  {
    id: 126731,
    global_relay_id: 'MDQ6VXNlcjEyNjczMQ==',
    login: 'schustafa',
    name: 'AJ Schuster',
    isSpammy: false,
  },
  {
    id: 2447456,
    global_relay_id: 'MDQ6VXNlcjI0NDc0NTY=',
    name: 'Dustin Savery',
    login: 'dusave',
    isSpammy: false,
  },
  {
    id: 41085564,
    global_relay_id: 'MDQ6VXNlcjQxMDg1NTY0',
    login: 'JelloBagel',
    name: 'Stephanie Hong',
    isSpammy: false,
  },
  {
    id: 15002980,
    global_relay_id: 'MDQ6VXNlcjE1MDAyOTgw',
    login: 'aguevara23',
    name: 'Alex Guevara',
    isSpammy: false,
  },
  {
    id: 22784140,
    global_relay_id: 'MDQ6VXNlcjIyNzg0MTQw',
    login: 'stephaniegiang',
    name: 'Stephanie Giang',
    isSpammy: false,
  },
  {
    id: 13594679,
    global_relay_id: 'MDQ6VXNlcjEzNTk0Njc5',
    login: 'tmelliottjr',
    name: 'Tom Elliott',
    isSpammy: false,
  },
  {
    id: 113158,
    global_relay_id: 'MDQ6VXNlcjExMzE1OA==',
    login: 'skw',
    name: 'Shaun Kirk Wong',
    isSpammy: false,
  },
  {
    id: 79995,
    global_relay_id: 'MDQ6VXNlcjc5OTk1',
    login: 'dewski',
    name: 'Garrett Bjerkhoel',
    isSpammy: false,
  },
  {
    id: 1682088,
    global_relay_id: 'MDQ6VXNlcjE2ODIwODg=',
    login: 'ericjorgensen',
    name: 'Eric Jorgensen',
    isSpammy: false,
  },
  {
    id: 101840513,
    global_relay_id: 'U_kgDOBhH2gQ',
    login: 'rileybroughten',
    name: 'Riley Broughten',
    isSpammy: false,
  },
  {
    id: 12748054,
    global_relay_id: 'MDQ6VXNlcjEyNzQ4MDU0',
    login: 'ohiosveryown',
    name: 'Matthew Pence',
    isSpammy: false,
  },
  {
    id: 126646200,
    global_relay_id: 'U_kgDOB4x3uA',
    login: 'anuradhayella',
    name: '',
    isSpammy: false,
  },
].map(u => ({...u, avatarUrl: `/assets/avatars/u/${u.id}.png`}))

export const org = {
  id: 9919,
  login: 'github',
  name: 'GitHub',
  type: 'organization' as const,
  avatarUrl: `/assets/avatars/u/9919.png`,
}
