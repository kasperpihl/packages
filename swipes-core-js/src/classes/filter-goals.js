import GoalsUtil from './goals-util';

export default function filterGoal(goal, filter) {
  const helper = new GoalsUtil(goal);
  const isCompleted = helper.getIsCompleted();

  const milestoneId = filter.get('milestoneId');
  // Supported: none || milestone.id
  if (milestoneId) {
    if (milestoneId === 'none') {
      if (goal.get('milestone_id')) {
        return false;
      }
    } else if (goal.get('milestone_id') !== milestoneId) {
      return false;
    }
  }

  // Check goal types
  const goalType = filter.get('goalType');
  // Supported: current, completed, starred
  if(goalType === 'completed' && !isCompleted){
    return false;
  }
  if (goalType && goalType !== 'completed' && isCompleted){
    return false;
  }
  if(goalType === 'starred' && !goal.get('starred')){
    return false;
  }

  // Check for assignees
  const userId = filter.get('userId');
  if (userId) {
    // Check all/completed goals for assignees filter
    if (!goalType || goalType === 'completed') {
      const allInvolved = helper.getAssignees();
      const hasUser = (allInvolved.indexOf(userId) > -1);
      if (userId !== 'none' && userId && !hasUser) {
        return false;
      }
      if (userId === 'none' && allInvolved.size) {
        return false;
      }
    }

    // Check current goals for assignees filter
    if (goalType === 'current') {
      const currentAssignees = helper.getAssignees();
      const isCurrentlyAssigned = currentAssignees.find(uId => uId === userId);
      if (!userId) {
        if (!currentAssignees.size) {
          return false;
        }
      } else if (userId === 'none') {
        if (currentAssignees.size && helper.getNumberOfSteps()) {
          return false;
        }
      } else if (!isCurrentlyAssigned) {
        return false;
      }
    }
  }

  // Check for search matching filter
  let matching = filter.get('matching');
  if (matching && matching.length) {
    matching = matching.toLowerCase();
    let foundMatch = false;

    if (goal.get('title').toLowerCase().includes(matching)) {
      foundMatch = true;
    }
    helper.getOrderedSteps().forEach((s) => {
      if (s.get('title').toLowerCase().includes(matching)) {
        foundMatch = true;
      }
      return !foundMatch;
    });
    helper.getOrderedAttachments().forEach((a) => {
      if (a.get('title').toLowerCase().includes(matching)) {
        foundMatch = true;
      }
      return !foundMatch;
    });
    if (!foundMatch) {
      return false;
    }
  }
  return true;
}
