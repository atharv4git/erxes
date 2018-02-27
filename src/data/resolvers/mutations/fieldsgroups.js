import { FieldsGroups } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const fieldsGroupsMutations = {
  /**
   * Create a new group for fields
   * @param {Object} doc - Graphql input data
   * @param {String} doc.name - Group name
   * @param {String} doc.contentType - Group type customer or company
   * @param {String} doc.description - Group description
   * @param {String} doc.lastUpdatedUserId - Id of user who updated the group last
   *
   * @return {Promise} Newly created Group
   */
  fieldsGroupsAdd(root, doc) {
    return FieldsGroups.createGroup(doc);
  },

  /**
   * Update group for fields
   * @param {Object} _id - Id of group to update
   * @param {Object} doc - Graphql input data
   * @param {String} doc.name - Group name
   * @param {String} doc.description - Id of parent group
   * @param {String} doc.lastUpdatedUserId - Id of user who updated the group last
   *
   * @return {Promise} Newly updated Group
   */
  fieldsGroupsEdit(root, { _id, ...doc }) {
    return FieldsGroups.updateGroup(_id, doc);
  },

  /**
   * Remove group
   * @param {Object} _id - Id of group to remove
   *
   * @return {Promise} Result
   */
  fieldsGroupsRemove(root, { _id }) {
    return FieldsGroups.removeGroup(_id);
  },

  /**
   * Update field group's visible
   * @param {String} _id - Field group id to update
   * @param {String} isVisible - True or false visible value
   * @param {String} lastUpdatedUserId - id of a User who updated the visible last
   *
   * @return {Promise} Updated field group
   */
  fieldsGroupsUpdateVisible(root, { _id, isVisible, lastUpdatedUserId }) {
    return FieldsGroups.updateGroupVisible(_id, isVisible, lastUpdatedUserId);
  },
};

moduleRequireLogin(fieldsGroupsMutations);

export default fieldsGroupsMutations;
