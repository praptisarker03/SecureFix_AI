import { createContext, useContext, useMemo, useState } from 'react'

const DataContext = createContext(null)

// The one place app pages read scan data from. It starts empty; when the
// scan backend exists, load projects and scans here with apiFetch().
export function DataProvider({ children }) {
  const [projects] = useState([])
  const [scans] = useState([])

  const value = useMemo(
    () => ({
      projects,
      scans,
      getProject: (id) => projects.find((p) => p.id === id),
      getScan: (id) => scans.find((s) => s.id === id),

      // TODO(backend): POST /scans with the zip, then return the new scan id
      startScan: async () => {
        throw new Error('Scanning needs the scan backend, which is not connected yet.')
      },
    }),
    [projects, scans]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within a DataProvider')
  return context
}
