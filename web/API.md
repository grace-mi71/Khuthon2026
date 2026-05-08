# 딴길 (Tangil) — API 명세서

프론트엔드 팀 전달용. 모든 엔드포인트는 Next.js Route Handler 로 구현되어 있으며, 로컬 개발 시 `http://localhost:3000` 기준입니다.

---

## 0. 공통 사항

### Base URL
- 로컬: `http://localhost:3000`
- 배포: 추후 결정

### Content-Type
- 요청 body: `application/json`
- 응답: `application/json` (단, `/api/chat/stream` 만 `text/event-stream`)

### 인증
- **현재 인증 미적용** — `userId` 를 클라이언트가 직접 들고 다닙니다.
- 회원가입 응답의 `userId` 를 `localStorage` 등에 저장 후 매 요청 query/body 에 포함.
- 추후 NextAuth 등으로 통합 예정.

### 임베딩 인코딩 (`embedding` 필드)
- 768차원 Float32 벡터를 base64 문자열로 인코딩.
- 클라이언트는 일반적으로 **opaque token** 으로 취급 → 받아서 그대로 다음 요청에 전달하면 됩니다.
- 디코딩이 필요한 경우만 [web/lib/vector-client.ts](lib/vector-client.ts) 의 `decodeEmbedding()` 사용.

### 공통 에러 응답
```json
{ "error": "에러 메시지 (한국어)" }
```
| HTTP | 의미 |
|------|------|
| 400 | 잘못된 요청 (필수 필드 누락 등) |
| 404 | 리소스 없음 (사용자/그룹 등) |
| 500 | 서버 내부 오류 (DB/Claude/임베딩 서버 장애) |

---

## 1. 회원가입

### `POST /api/auth/register`

취미 카테고리를 받아 사용자 프로필 생성 + 취향 임베딩 계산.

**Request body**
```json
{
  "email": "test@test.com",
  "hobbies": ["음악", "영화"]
}
```
- `hobbies`: `Hobby[]` (1개 이상 필수). 가능 값:
  `"독서" | "영화" | "음악" | "여행" | "운동" | "요리" | "게임" | "미술"`
  → 취미 카테고리 확장 예정 (현재 8개)

**Response 200**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "embedding": "<base64 string>"
}
```

**curl**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","hobbies":["음악","영화"]}'
```

---

## 2. 취향 탐정 채팅 (SSE 스트림)

### `POST /api/chat/stream`

Claude Haiku 가 사용자의 취향을 탐색하는 5~7턴 대화. **SSE(Server-Sent Events)** 로 실시간 스트리밍.

**Request body**
```json
{
  "messages": [
    { "role": "user", "content": "안녕하세요" }
  ]
}
```
- `messages`: 지금까지의 대화 전체. (Claude API 와 동일 포맷)

**Response (text/event-stream)**
```
data: {"delta":"안녕"}

data: {"delta":"하세요!"}

data: {"delta":" 어떤"}

data: [DONE]
```
- 각 줄은 `data: <JSON>\n\n` 형식.
- 종료는 `data: [DONE]`.
- 에러 발생 시: `data: {"error":"..."}` 후 종료.

**클라이언트 예시 (fetch + ReadableStream)**
```ts
const res = await fetch("/api/chat/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages }),
});

const reader = res.body!.getReader();
const decoder = new TextDecoder();
let buf = "";
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buf += decoder.decode(value, { stream: true });
  const lines = buf.split("\n\n");
  buf = lines.pop() ?? "";
  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const payload = line.slice(6);
    if (payload === "[DONE]") return;
    const { delta, error } = JSON.parse(payload);
    if (error) throw new Error(error);
    if (delta) onDelta(delta);  // UI 에 토큰 추가
  }
}
```

> ⚠️ `EventSource` 는 GET 만 지원하므로 위처럼 `fetch` 로 처리.

---

## 3. 채팅 종료 + 취향 업데이트

### `POST /api/chat/finalize`

대화 종료 후 호출. Claude 로 sensory_tags/inferred_genres 추출 → 임베딩 업데이트 → **자동으로 그룹 배정 트리거** (fire-and-forget).

**Request body**
```json
{
  "userId": "550e8400-...",
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response 200**
```json
{
  "sensory_tags": ["몰입감", "섬세함", "감성적"],
  "inferred_genres": ["뮤지컬", "연극"],
  "embedding": "<base64 string>"
}
```

> 그룹 배정은 백그라운드로 진행됩니다. 결과 확인은 `/api/groups/mine` 으로 폴링하거나, 곧바로 `/api/groups/assign` 을 동기 호출해도 됩니다.

---

## 4. 랜딩 추천 (로그인 사용자)

### `GET /api/landing/recommendations`

저장된 `tasteEmbedding` 기반으로 step 단계의 공연을 추천.

**Query params**
| 이름 | 타입 | 필수 | 기본값 | 설명 |
|------|------|-----|------|------|
| `userId` | string | ✅ | — | 회원가입 시 받은 ID |
| `step` | 1~5 | | 2 | 취향 슬라이더 (1=매우 유사, 5=파격) |
| `limit` | int | | 10 | 결과 수 |

**Response 200**
```json
{
  "userId": "550e8400-...",
  "hobbies": ["음악", "영화"],
  "embedding": "<base64>",
  "step": 2,
  "count": 10,
  "results": [
    {
      "id": "PF252469",
      "title": "라이프 인 어 데이",
      "genre": "연극",
      "venue_name": "예술공간 서울",
      "region": "서울",
      "poster_url": "http://www.kopis.or.kr/.../poster.jpg",
      "start_date": "2025-12-05",
      "end_date": "2025-12-28",
      "price": "전석 35,000원",
      "state": "공연중",
      "popularity": 47,
      "trend_score": 0.32,
      "sensory_tags": ["섬세함", "몰입감"],
      "score": 0.812
    }
  ]
}
```

**curl**
```bash
curl "http://localhost:3000/api/landing/recommendations?userId=<USER_ID>&step=3"
```

---

## 5. 임베딩 직접 검색 (취향 슬라이더)

### `GET /api/recommend`

`userId` 없이 임베딩만으로 검색. 비로그인 탐색이나 슬라이더 실시간 변경 시 사용.

**Query params**
| 이름 | 타입 | 필수 | 기본값 | 설명 |
|------|------|-----|------|------|
| `embedding` | base64 | ✅ | — | 768차원 벡터 (`encodeEmbedding` 출력) |
| `step` | 1~5 | ✅ | — | 취향 슬라이더 |
| `region` | string | | — | 지역 필터 (예: `"서울"`) |
| `exclude` | csv string | | — | 제외할 공연 ID (콤마 구분) |
| `limit` | int | | 10 | 결과 수 |

**Response 200**
```json
{
  "step": 3,
  "count": 10,
  "results": [
    {
      "id": "PF252469",
      "title": "...",
      "genre": "연극",
      "venue_name": "...",
      "region": "서울",
      "poster_url": "...",
      "start_date": "...",
      "end_date": "...",
      "price": "...",
      "state": "공연중",
      "popularity": 47,
      "trend_score": 0.32,
      "sensory_tags": ["..."],
      "distance": 0.482,
      "score": 0.518
    }
  ]
}
```

**Step → 거리 매핑 (참고)**
| step | label | 코사인 거리 범위 |
|------|-------|-----------------|
| 1 | 매우 유사 | 0.15 ~ 0.35 |
| 2 | 비슷한 | 0.30 ~ 0.50 |
| 3 | 새로운 | 0.45 ~ 0.65 |
| 4 | 도전 | 0.60 ~ 0.75 |
| 5 | 파격 | 0.65 ~ 0.85 |

---

## 6. 그룹 배정

### `POST /api/groups/assign`

`tasteEmbedding` 과 기존 그룹 centroid 비교 → 코사인 거리 < 0.25 면 합류, 아니면 새 그룹 생성. 그룹 이름은 Claude 가 sensory_tags 로 작명.

**Request body**
```json
{ "userId": "550e8400-..." }
```

**Response 200**
```json
{ "groupId": "a1b2c3d4-..." }
```

> `/api/chat/finalize` 가 자동으로 호출하므로 일반적으로 직접 호출할 필요 없음. 재배정 시에만 명시적 호출.

---

## 7. 내 그룹 목록

### `GET /api/groups/mine`

**Query params**
| 이름 | 타입 | 필수 | 설명 |
|------|------|-----|------|
| `userId` | string | ✅ | — |

**Response 200**
```json
{
  "groups": [
    {
      "id": "a1b2c3d4-...",
      "name": "새벽 감성 탐험가",
      "member_count": 7,
      "last_message": "어제 본 공연 너무 좋았어요"
    }
  ]
}
```

---

## 8. 그룹 메시지 조회 / 작성

### `GET /api/groups/:id/messages`

**Query params**
| 이름 | 타입 | 필수 | 기본값 | 설명 |
|------|------|-----|------|------|
| `cursor` | string | | — | 마지막 메시지 ID (페이지네이션) |
| `limit` | int | | 30 | 페이지 크기 |

**Response 200**
```json
{
  "messages": [
    {
      "id": "msg-uuid",
      "group_id": "grp-uuid",
      "user_id": "user-uuid",
      "content": "안녕하세요",
      "created_at": "2026-05-09T10:30:00.000Z"
    }
  ],
  "nextCursor": "msg-uuid-or-null"
}
```
- `messages` 는 오래된 것 → 최신 순.
- `nextCursor` 가 있으면 더 이전 메시지 존재.

### `POST /api/groups/:id/messages`

**Request body**
```json
{
  "userId": "550e8400-...",
  "content": "안녕하세요"
}
```

**Response 200**
```json
{
  "id": "msg-uuid",
  "groupId": "grp-uuid",
  "userId": "user-uuid",
  "content": "안녕하세요"
}
```

> 실시간 갱신은 현재 미구현 (단순 폴링 또는 메시지 전송 후 GET 재호출). WebSocket/Pusher 연동은 다음 단계.

---

## 9. 리뷰 작성 / 조회

### `POST /api/reviews`

리뷰 텍스트 → Claude 가 positive/negative/mood 태그 자동 추출 → DB 저장.

**Request body**
```json
{
  "userId": "550e8400-...",
  "perfId": "PF252469",
  "text": "기대보다 훨씬 좋았어요. 배우 표정이 인상적이었습니다."
}
```

**Response 200**
```json
{
  "id": "review-uuid",
  "perfId": "PF252469",
  "tags": {
    "positive": ["배우 연기", "감동적"],
    "negative": [],
    "mood": ["섬세함", "몰입감"]
  }
}
```

### `GET /api/reviews?perfId=<id>`

해당 공연의 최근 50개 리뷰.

**Response 200**
```json
{
  "perfId": "PF252469",
  "count": 12,
  "reviews": [
    {
      "id": "review-uuid",
      "user_id": "user-uuid",
      "text": "...",
      "tags": { "positive": [...], "negative": [...], "mood": [...] },
      "created_at": "2026-05-09T..."
    }
  ]
}
```

---

## 10. 전형적인 사용자 플로우

### 신규 사용자
```
1. POST /api/auth/register             → userId, embedding
2. GET  /api/landing/recommendations   → step=2 추천 (간단 추천)
3. POST /api/chat/stream (반복)         → 취향 탐정 5~7턴
4. POST /api/chat/finalize             → tasteEmbedding 정밀화 + 자동 그룹 배정
5. GET  /api/groups/mine               → 배정된 그룹 확인
6. GET  /api/landing/recommendations   → step 별 정밀 추천
```

### 슬라이더로 탐색
```
GET /api/recommend?embedding=<...>&step=1   # 매우 유사
GET /api/recommend?embedding=<...>&step=5   # 파격
```

### 그룹 채팅
```
GET  /api/groups/mine                  → 그룹 목록
GET  /api/groups/<id>/messages         → 메시지 페이지 1
POST /api/groups/<id>/messages         → 새 메시지 작성
```

### 공연 후 리뷰
```
POST /api/reviews                       → 리뷰 + 자동 태그 추출
GET  /api/reviews?perfId=<id>           → 다른 사람 리뷰
```

---

## 11. 데이터 타입 (TypeScript)

전체 정의는 [web/lib/types.ts](lib/types.ts) 참고.

```ts
type Hobby =
  | "독서" | "영화" | "음악" | "여행"
  | "운동" | "요리" | "게임" | "미술";

type TasteStep = 1 | 2 | 3 | 4 | 5;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ReviewTags {
  positive: string[];
  negative: string[];
  mood: string[];
}
```

---

## 12. 알려진 제한사항

- **인증 미구현** — `userId` 가 클라이언트에 노출됨. 프로토타입 단계 한정.
- **그룹 채팅 실시간 갱신 미구현** — 폴링 필요.
- **embed_server 의존** — 임베딩 서버(`localhost:8765`) 다운 시 회원가입의 임베딩 품질이 centroid fallback 으로 저하 (서비스 자체는 동작).
- **트렌드 점수** — Naver/YouTube 키 없으면 `trend_score: 0` 으로 fallback. 추천 동작은 정상이지만 "숨겨진 보석" 보너스가 비활성화됨.

---

## 13. 환경 변수 (백엔드 — 프론트는 직접 다룰 일 없음)

`web/.env.local` 에 설정. 자세한 항목은 백엔드 담당자에게 문의.
- `ANTHROPIC_KEY` — Claude API
- `KV_REST_API_*` — Vercel KV (Upstash)
- `POSTGRES_*` — Vercel Postgres (Neon)
- `EMBED_SERVER_URL` — 기본 `http://localhost:8765`

---

문의: 백엔드 담당 (검색 엔진/AI)
