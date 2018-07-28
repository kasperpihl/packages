import * as ca from './';

// ======================================================
export const create = name => ca.api.request('organizations.create', {
  organization_name: name,
});

export const join = orgId => ca.api.request('organizations.join', {
  organization_id: orgId,
});

export const leave = orgId => (d, getState) => d(ca.api.request('organizations.leave', {
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
}));

export const inviteUser = (firstName, email) => (d, getState) => d(ca.api.request('organizations.inviteUser', {
  first_name: firstName,
  email,
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
}));

export const deleteOrg = orgId => (d, getState) => d(ca.api.request('organizations.delete', {
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
}));

export const promoteToAdmin = (orgId, userId) => ca.api.request('organizations.promoteToAdmin', {
  organization_id: orgId,
  user_to_promote_id: userId,
});

export const demoteAnAdmin = (orgId, userId) => ca.api.request('organizations.demoteAnAdmin', {
  organization_id: orgId,
  user_to_demote_id: userId,
});

export const enableUser = (orgId, userId) => ca.api.request('organizations.enableUser', {
  organization_id: orgId,
  user_to_enable_id: userId,
});

export const disableUser = (orgId, userId) => ca.api.request('organizations.disableUser', {
  organization_id: orgId,
  user_to_disable_id: userId,
});

export const createStripeCustomer = (token, plan) => (d, getState) => d(ca.api.request('organizations.createStripeCustomer', {
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
  stripe_token: token,
  plan,
}));

export const changeBillingPlan = plan => (d, getState) => d(ca.api.request('organizations.changeStripeSubscriptionPlan', {
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
  plan_to_change: plan,
}));

export const changeCardDetails = token => (d, getState) => d(ca.api.request('organizations.updateStripeCardDetails', {
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
  stripe_token: token,
}));

export const reorderPlans = order => (d, getState) => d(ca.api.request('organizations.milestoneReorder', {
  organization_id: getState().me.getIn(['organizations', 0, 'id']),
  milestone_order: order,
}));

