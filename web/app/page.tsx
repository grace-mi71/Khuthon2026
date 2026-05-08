export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>딴길 (Tangil)</h1>
      <p>취향을 단계적으로 확장하는 공연 발견 서비스</p>
      <p style={{ color: "#666", marginTop: "1rem" }}>
        백엔드 API: <code>/api/recommend</code>, <code>/api/auth/register</code>,{" "}
        <code>/api/chat/stream</code>, <code>/api/groups/*</code>,{" "}
        <code>/api/reviews</code>
      </p>
    </main>
  );
}
