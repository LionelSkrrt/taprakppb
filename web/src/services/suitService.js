import { cachedGet } from './queryCache'

const suitService = {
  // params: { q, series_id }
  getAll: (params = {}) => cachedGet('/mobile-suits', params),
  getById: (id) => cachedGet(`/mobile-suits/${id}`),
}

export default suitService
