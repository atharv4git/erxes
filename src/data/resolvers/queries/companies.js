import { Companies, Segments, Tags } from '../../../db/models';
import QueryBuilder from './segmentQueryBuilder';
import {
  TAG_TYPES,
  COC_CONTENT_TYPES,
  COC_LEAD_STATUS_TYPES,
  COC_LIFECYCLE_STATE_TYPES,
} from '../../constants';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';
import { cocsExport } from './cocExport';

const listQuery = async params => {
  let selector = {};

  // Filter by segments
  if (params.segment) {
    const segment = await Segments.findOne({ _id: params.segment });
    const query = QueryBuilder.segments(segment);
    Object.assign(selector, query);
  }

  if (params.searchValue) {
    const fields = [
      { names: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } },
      { website: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { industry: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { plan: new RegExp(`.*${params.searchValue}.*`, 'i') },
    ];

    selector = { $or: fields };
  }

  // Filter by tag
  if (params.tag) {
    selector.tagIds = params.tag;
  }

  // filter directly using ids
  if (params.ids) {
    selector = { _id: { $in: params.ids } };
  }

  // filter by lead status
  if (params.leadStatus) {
    selector.leadStatus = params.leadStatus;
  }

  // filter by life cycle state
  if (params.lifecycleState) {
    selector.lifecycleState = params.lifecycleState;
  }

  return selector;
};

const sortBuilder = params => {
  let sortParams = { primaryName: -1 };
  const sorter = params.sorter;
  const sortType = params.sortType;

  if (sorter) {
    sortParams = { [sorter]: sortType };
  }

  return sortParams;
};

const companyQueries = {
  /**
   * Companies list
   * @param {Object} args
   * @return {Promise} filtered companies list by given parameters
   */
  async companies(root, params) {
    const selector = await listQuery(params);

    const sortParams = sortBuilder(params);

    return paginate(Companies.find(selector), params).sort(sortParams);
  },

  /**
   * Companies for only main list
   * @param {Object} args
   * @return {Promise} filtered companies list by given parameters
   */
  async companiesMain(root, params) {
    const selector = await listQuery(params);
    const sortParams = sortBuilder(params);

    const list = await paginate(Companies.find(selector).sort(sortParams), params);
    const totalCount = await Companies.find(selector).count();

    return { list, totalCount };
  },

  /**
   * Group company counts by segments
   * @param {Object} args - Query params
   * @return {Object} counts map
   */
  async companyCounts(root, args) {
    const counts = {
      bySegment: {},
      byTag: {},
      byLeadStatus: {},
      byLifecycleState: {},
    };

    const selector = await listQuery(args);

    const count = query => {
      const findQuery = Object.assign({}, selector, query);
      return Companies.find(findQuery).count();
    };

    // Count companies by segments
    const segments = await Segments.find({
      contentType: COC_CONTENT_TYPES.COMPANY,
    });

    for (let s of segments) {
      counts.bySegment[s._id] = await count(QueryBuilder.segments(s));
    }

    // Count companies by tag
    const tags = await Tags.find({ type: TAG_TYPES.COMPANY });

    for (let tag of tags) {
      counts.byTag[tag._id] = await count({ tagIds: tag._id });
    }

    // Count companies by lead status
    for (let status of COC_LEAD_STATUS_TYPES) {
      counts.byLeadStatus[status] = await count({ leadStatus: status });
    }

    // Count companies by life cycle state
    for (let state of COC_LIFECYCLE_STATE_TYPES) {
      counts.byLifecycleState[state] = await count({ lifecycleState: state });
    }

    return counts;
  },

  /**
   * Get one company
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found company
   */
  companyDetail(root, { _id }) {
    return Companies.findOne({ _id });
  },

  /**
   * Export companies to xls file
   *
   * @param {Object} args - Query params
   * @return {String} File url
   */
  async companiesExport(root, params) {
    const selector = await listQuery(params);

    const sortParams = sortBuilder(params);

    const companies = await paginate(Companies.find(selector), params).sort(sortParams);

    return cocsExport(companies, 'company');
  },
};

moduleRequireLogin(companyQueries);

export default companyQueries;
