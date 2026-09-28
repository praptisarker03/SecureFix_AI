// Side-by-side diff. Lines that exist only on one side are highlighted; this
// is a simple set comparison, which is enough for the short AI patches.
export function DiffView({ before, after, file }) {
  const afterLines = new Set(after)
  const beforeLines = new Set(before)
  return (
    <div className="diff-split">
      <div className="diff-pane">
        <div className="diff-head"><span className="diff-tag del">Before</span><span className="mono">{file}</span></div>
        <pre>
          {before.map((line, i) => (
            <div key={i} className={`diff-line ${afterLines.has(line) ? '' : 'del'}`}>
              <span className="ln">{i + 1}</span>
              <span className="mark">{afterLines.has(line) ? ' ' : '-'}</span>
              <code>{line}</code>
            </div>
          ))}
        </pre>
      </div>
      <div className="diff-pane">
        <div className="diff-head"><span className="diff-tag add">After (AI fix)</span><span className="mono">{file}</span></div>
        <pre>
          {after.map((line, i) => (
            <div key={i} className={`diff-line ${beforeLines.has(line) ? '' : 'add'}`}>
              <span className="ln">{i + 1}</span>
              <span className="mark">{beforeLines.has(line) ? ' ' : '+'}</span>
              <code>{line}</code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}
