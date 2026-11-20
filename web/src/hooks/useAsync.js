import { useCallback, useEffect, useState } from 'react'

// Menjalankan fungsi async (mis. memanggil service) setiap `key` berubah.
// Mengembalikan { data, loading, error, status, retry }.
// `key` harus berupa nilai primitif/string supaya perbandingannya stabil.
export function useAsync(run, key) {
  const [state, setState] = useState({ data: null, loading: true, error: null, status: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, loading: true, error: null, status: null }))
    run()
      .then((data) => active && setState({ data, loading: false, error: null, status: null }))
      .catch(
        (err) =>
          active &&
          setState({
            data: null,
            loading: false,
            error: err?.message || 'Gagal memuat data.',
            status: err?.status ?? null,
          }),
      )
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, retry }
}
