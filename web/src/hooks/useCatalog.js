import seriesService from '../services/seriesService'
import suitService from '../services/suitService'
import { useAsync } from './useAsync'

export const useSeriesList = (q = '') =>
  useAsync(() => seriesService.getAll({ q }), `series:${q}`)

export const useSeries = (id) =>
  useAsync(() => seriesService.getById(id), `series-detail:${id}`)

export const useSuits = ({ q = '', seriesId = '' } = {}) =>
  useAsync(
    () => suitService.getAll({ q, series_id: seriesId }),
    `suits:${q}:${seriesId}`,
  )

export const useSuit = (id) =>
  useAsync(() => suitService.getById(id), `suit-detail:${id}`)
