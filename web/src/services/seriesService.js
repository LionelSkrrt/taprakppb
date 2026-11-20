import { cachedGet } from './queryCache'

const seriesService = {
  getAll: (params = {}) => cachedGet('/series', params),
  getById: (id) => cachedGet(`/series/${id}`),
}

export default seriesService
