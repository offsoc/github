import {todayString, tomorrowString} from '../helpers/dates'

// Use \t because VSCode likes to auto-trim whitespace from end of lines 🤦
export const integrationTestsWithItemsTsv = `Title\tURL\tAssignees\tStatus\tLabels\tRepository\tMilestone\tLinked pull requests\tTracks\tTracked by\tType\tReviewers\tStage\tTeam\tEstimate\tDue Date
This is the title for my closed issue. Now that I've closed it, the text is really and long and should elide!\thttps://github.com/github/memex/issues/336\tdmarcey, iansan5653\tDone\tenhancement ✨, tech debt\tgithub/memex\tv0.1 - Prioritized Lists?\thttps://github.com/github/memex/issues/1234\t\t\t\t\t\tNovelty Aardvarks\t10\t${todayString}
Update styles for table\thttps://github.com/github/memex/pull/337\tmikesurowiec\tDone\t\tgithub/memex\t\t\t\t\t\tdmarcey, Memex Team 1\tClosed\t\t10\t
Here is a Draft Issue!\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t
This is a closed issue for testing\thttps://github.com/github/memex/issues/101\tlerebear\tDone\tenhancement ✨\tgithub/memex\tv0.1 - Prioritized Lists?\t\t\t\tBatch\t\t\tDesign Systems\t3\t${todayString}
Fix this \`issue\` please!\thttps://github.com/github/memex/issues/336\ttraumverloren\tBacklog\tenhancement ✨\tgithub/memex\tSprint 9\thttps://github.com/github/memex/issues/123, https://github.com/github/memex/issues/456, https://github.com/github/memex/issues/789\t64% of 11\thttps://github.com/github/memex/issues/335\tBug\t\t\tNovelty Aardvarks\t1\t
Fixes all the bugs\thttps://github.com/github/memex/pull/337\t\tBacklog\t\tgithub/memex\tv0.1 - Prioritized Lists?\t\t\t\t\t\tUp Next\t\t\t${tomorrowString}
https://google.com\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t`
