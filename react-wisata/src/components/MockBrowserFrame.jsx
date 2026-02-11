export default function MockBrowserFrame({ children }) {
  return (
    <div style={styles.page}>
      <div style={styles.browser}>
        <div style={styles.top}>
          <div style={styles.row}>
            <div style={styles.btn}>◀</div>
            <div style={styles.btn}>▶</div>
            <div style={styles.btn}>✕</div>
            <div style={styles.btn}>⌂</div>
            <div style={styles.addr}><span style={{opacity:.7}}>https://</span></div>
            <div style={styles.search}></div>
          </div>
          <div style={styles.title}>A Web Page</div>
        </div>

        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#f2f2f2", padding: 18 },
  browser: { width: 420, maxWidth: "95vw", border: "2px solid #333", background: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,0.12)" },
  top: { borderBottom: "2px solid #333", padding: "10px 12px 8px", background: "#e9e9e9" },
  row: { display: "grid", gridTemplateColumns: "28px 28px 28px 28px 1fr 64px", gap: 8, alignItems: "center" },
  btn: { width: 28, height: 24, border: "2px solid #333", display: "grid", placeItems: "center", fontSize: 12, background: "#fff" },
  addr: { height: 26, border: "2px solid #333", background: "#fff", display: "flex", alignItems: "center", padding: "0 10px", fontSize: 12 },
  search: { height: 26, border: "2px solid #333", background: "#fff", borderRadius: 999 },
  title: { textAlign: "center", fontWeight: 700, fontSize: 14, marginTop: 6 },
  body: { background: "#dcdcdc", padding: 26 },
};
