// Section divider: "// LABEL ———————" at the top of each home page section
export default function SectionLabel({ children }) {
  return <div className="section-label"><span aria-hidden="true">//</span> {children}</div>;
}
