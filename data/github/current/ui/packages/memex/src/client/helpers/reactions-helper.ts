import type {ReactionEmotion, Reactions} from '../api/side-panel/contracts'

/**
 * returns an updated list of reactions after reaction action
 * @param oldReactions - old list of reactions before reaction action
 * @param reaction - reaction to add or remove
 * @param actor - user who reacted
 * @param reacted - true if reaction should be added, false if reaction should be removed
 */
export function getUpdatedReactions(
  oldReactions: Reactions,
  reaction: ReactionEmotion,
  actor: string,
  reacted: boolean,
): Reactions {
  const updatedReactions = oldReactions
  if (reacted) {
    updatedReactions[reaction] = updatedReactions[reaction]?.filter(a => a !== actor)
  } else {
    if (reaction in updatedReactions) {
      updatedReactions[reaction]?.push(actor)
    } else {
      updatedReactions[reaction] = [actor]
    }
  }
  return updatedReactions
}
