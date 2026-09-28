import { createContext, useContext, useMemo, useState } from 'react'

const DataContext = createContext(null)

class BackendNotConnectedError extends Error {
  constructor(feature) {
    super(`${feature} needs the scan backend, which is not connected yet.`)
  }
}

// Single place the app pages read scan data from. Everything starts empty;
// when the backend endpoints exist, load them here with apiFetch() and
// replace the stubs below. No page needs to change.
export function DataProvider({ children }) {
  const [projects] = useState([])
  const [scans] = useState([])
  const [findings, setFindings] = useState([])
  const [evaluation] = useState([])
  const [fpRules, setFpRules] = useState([])

  const value = useMemo(
    () => ({
      projects,
      scans,
      findings,
      evaluation,
      getProject: (id) => projects.find((p) => p.id === id),
      getScan: (id) => scans.find((s) => s.id === id),
      getFinding: (id) => findings.find((f) => f.id === id),

      setFindingStatus: (id, status) =>
        setFindings((list) => list.map((f) => (f.id === id ? { ...f, status } : f))),

      // TODO(backend): POST /scans with the zip, then return the new scan id
      startScan: async () => {
        throw new BackendNotConnectedError('Scanning')
      },
      // TODO(backend): POST /findings/{id}/fix, then GET its verification
      applyFix: async () => {
        throw new BackendNotConnectedError('Applying a fix')
      },

      fpRules,
      addFpRule: (rule) => setFpRules((r) => [...r, { ...rule, id: `r${Date.now()}` }]),
      removeFpRule: (id) => setFpRules((r) => r.filter((x) => x.id !== id)),
    }),
    [projects, scans, findings, evaluation, fpRules]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within a DataProvider')
  return context
}
