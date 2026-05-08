/**
 * 딴길 — 데모 시연용 더미 데이터 시드 스크립트
 *
 * 실행:
 *   cd web && node --env-file=.env.local scripts/seed-demo.mjs
 *
 * 생성 내용:
 *   - Vercel KV: 더미 사용자 6명 (user:, email: 키)
 *   - Postgres: 그룹 2개, 멤버, 채팅 메시지, 공연 리뷰
 */

import { kv } from "@vercel/kv";
import { sql } from "@vercel/postgres";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { randomUUID } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── 외부 데이터 로드 ─────────────────────────────────────────────────────────

const centroids = JSON.parse(
  readFileSync(join(__dirname, "../../data/genre_centroids.json"), "utf-8")
);
const contents = JSON.parse(
  readFileSync(join(__dirname, "../../data/contents.json"), "utf-8")
);
const perfIds = Object.keys(contents).slice(0, 8);

// ── 벡터 유틸 ────────────────────────────────────────────────────────────────

function normalizeVec(vec) {
  const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0));
  return vec.map((x) => x / norm);
}

function weightedBlend(weights) {
  const dim = 768;
  const result = new Array(dim).fill(0);
  for (const [genre, w] of Object.entries(weights)) {
    const c = centroids[genre];
    for (let i = 0; i < dim; i++) result[i] += c[i] * w;
  }
  return normalizeVec(result);
}

function addNoise(vec, scale = 0.04) {
  const noisy = vec.map((x) => x + (Math.random() - 0.5) * scale);
  return normalizeVec(noisy);
}

function daysAgo(n, offsetMinutes = 0) {
  return new Date(Date.now() - n * 86_400_000 - offsetMinutes * 60_000).toISOString();
}

// ── 더미 사용자 정의 ─────────────────────────────────────────────────────────

const DUMMY_USERS = [
  {
    name: "김민지",
    email: "minji@demo.tangil",
    hobbies: ["음악", "영화"],
    genreWeights: { 뮤지컬: 0.7, 연극: 0.3 },
    sensoryTags: ["웅장함", "감동적", "몰입감", "화려함"],
  },
  {
    name: "이준호",
    email: "junho@demo.tangil",
    hobbies: ["독서", "영화"],
    genreWeights: { 연극: 0.6, 뮤지컬: 0.4 },
    sensoryTags: ["섬세함", "긴장감", "몰입감", "여운"],
  },
  {
    name: "박서연",
    email: "seoyeon@demo.tangil",
    hobbies: ["음악", "미술"],
    genreWeights: { 음악: 0.8, 무용: 0.2 },
    sensoryTags: ["고요함", "우아함", "정교함", "감동적"],
  },
  {
    name: "최다혜",
    email: "dahye@demo.tangil",
    hobbies: ["운동", "미술"],
    genreWeights: { 무용: 0.7, "서커스/마술": 0.3 },
    sensoryTags: ["역동적", "화려함", "에너지", "경이로움"],
  },
  {
    name: "정우성",
    email: "woosung@demo.tangil",
    hobbies: ["여행", "음악"],
    genreWeights: { 국악: 0.8, 음악: 0.2 },
    sensoryTags: ["전통적", "깊이감", "흥겨움", "울림"],
  },
  {
    name: "나해린",
    email: "haerin@demo.tangil",
    hobbies: ["독서", "영화"],
    genreWeights: { 연극: 0.5, 뮤지컬: 0.5 },
    sensoryTags: ["감동적", "몰입감", "서정적", "섬세함"],
  },
];

// ── 그룹 정의 ────────────────────────────────────────────────────────────────

const GROUPS = [
  {
    name: "새벽 감성 탐험가",
    memberEmails: ["minji@demo.tangil", "junho@demo.tangil", "haerin@demo.tangil"],
    genreWeights: { 뮤지컬: 0.5, 연극: 0.5 },
    messages: [
      { from: "minji@demo.tangil",  text: "어제 메리골드 봤는데 진짜 대박이었어요 배우들 눈빛에서 눈을 못 떼겠더라고요" },
      { from: "junho@demo.tangil",  text: "저도 지난달에 봤는데 2막 도입부 완전 소름… 혹시 이날치 라이브 보신 분 계세요?" },
      { from: "haerin@demo.tangil", text: "이날치 저 작년에 봤어요! 처음엔 낯설었는데 중간부터 몸이 저절로 따라가더라고요 😂" },
      { from: "minji@demo.tangil",  text: "오오 진짜요? 저는 국악 계열은 아직 좀 낯선데 추천해주신다면 어디서 시작할까요" },
      { from: "junho@demo.tangil",  text: "국악 처음이시면 퓨전 국악부터 추천드려요. 앙상블 시나위나 정가악회 공연이 입문하기 좋아요" },
      { from: "haerin@demo.tangil", text: "맞아요 퓨전부터 시작하면 훨씬 편하게 즐길 수 있더라고요. 다음 달에 소극장 연극도 같이 보실 분?" },
      { from: "minji@demo.tangil",  text: "저 갈게요! 어떤 작품이에요?" },
      { from: "haerin@demo.tangil", text: "12인의 성난 사람들 대학로 재공연이에요. 법정 스릴러인데 배우들 연기 밀도가 진짜예요" },
      { from: "junho@demo.tangil",  text: "저도 관심 있었던 작품이에요 🙌 날짜 잡히면 알려주세요" },
      { from: "minji@demo.tangil",  text: "딴길 추천 보니까 저한테 소극장 창작 뮤지컬 쪽이 많이 뜨더라고요. 처음엔 낯설었는데 점점 좋아지는 것 같아요" },
      { from: "haerin@demo.tangil", text: "취향이 넓어지는 느낌 완전 공감해요! 저도 처음엔 대형 뮤지컬만 봤었는데 이제 소극장도 자주 찾게 됐어요" },
      { from: "junho@demo.tangil",  text: "그게 딴길의 매력이죠 ㅎㅎ 다음 주 빈센트 반 고흐 같이 보실 분 계신가요?" },
    ],
  },
  {
    name: "소극장 단골손님",
    memberEmails: ["seoyeon@demo.tangil", "dahye@demo.tangil", "woosung@demo.tangil"],
    genreWeights: { 음악: 0.4, 무용: 0.35, 국악: 0.25 },
    messages: [
      { from: "seoyeon@demo.tangil", text: "이번 주말에 예술의전당 챔버 뮤직 가실 분? 브람스 피아노 트리오 프로그램이에요" },
      { from: "dahye@demo.tangil",   text: "저 가고싶은데 토요일 낮 공연인가요?" },
      { from: "woosung@demo.tangil", text: "저는 이번엔 국악 공연 보러 가려고요. 판소리 완창이 오랜만이라서" },
      { from: "seoyeon@demo.tangil", text: "판소리 완창이요? 어떤 명창이신가요?" },
      { from: "woosung@demo.tangil", text: "故박동진 선생 추모 공연으로 제자 분들이 흥보가 완창하는 거예요. 4시간인데 진짜 압도적이에요" },
      { from: "dahye@demo.tangil",   text: "4시간… 대단하다 진짜. 저는 무용이 특히 좋은데 몸이 무언가를 말하는 걸 보는 게 좋아요" },
      { from: "seoyeon@demo.tangil", text: "국립무용단 신작 공연 다음 달에 있던데 보셨어요? 한국 전통 미학을 현대적으로 재해석한다고 하더라고요" },
      { from: "dahye@demo.tangil",   text: "오! 저도 기대하고 있었어요. 안무가가 엄청 실험적인 분이라서" },
      { from: "woosung@demo.tangil", text: "국악이랑 무용이 결합된 공연도 꽤 있던데 저도 같이 봐도 될 것 같아요 😄" },
      { from: "seoyeon@demo.tangil", text: "장르 경계 없이 보다 보면 더 깊이 즐기게 되는 것 같아요. 딴길 쓰면서 클래식-국악 연결이 자연스러워진 것 같고" },
      { from: "dahye@demo.tangil",   text: "맞아요 저도 무용만 보다가 서커스 공연 추천받았는데 진짜 새로운 세계였어요" },
    ],
  },
];

// ── 리뷰 데이터 ──────────────────────────────────────────────────────────────

const REVIEWS = [
  {
    userEmail: "minji@demo.tangil",
    text: "오랜만에 본 대형 뮤지컬인데 무대 장치 하나하나가 정말 정교했어요. 2막 합창 장면은 눈물이 날 뻔했고, 공연 내내 시간 가는 줄 몰랐습니다.",
    tags: { positive: ["웅장함", "감동적", "몰입감"], negative: [], mood: ["황홀한", "벅찬"] },
  },
  {
    userEmail: "junho@demo.tangil",
    text: "소극장이라 처음엔 어색할 줄 알았는데 오히려 배우와의 거리감이 공연에 깊이를 더해줬어요. 대사 한마디 한마디가 귀에 꽂히고, 마지막 장면에서 한동안 자리를 뜰 수 없었어요.",
    tags: { positive: ["섬세함", "여운", "몰입감"], negative: [], mood: ["진지한", "묵직한"] },
  },
  {
    userEmail: "seoyeon@demo.tangil",
    text: "현악 앙상블의 음색이 너무 아름다웠어요. 2바이올린과 비올라의 내성부 선율이 정말 섬세하게 살아있었고, 연주자들 간의 호흡이 완벽했습니다. 클래식 입문자에게도 강력 추천해요.",
    tags: { positive: ["정교함", "우아함", "감동적"], negative: [], mood: ["평온한", "서정적"] },
  },
  {
    userEmail: "dahye@demo.tangil",
    text: "무용수들의 몸 하나로 이렇게 다양한 감정을 전달할 수 있다는 게 놀라웠어요. 현대무용이라 처음엔 어떻게 봐야 할지 몰랐는데 그냥 느끼면 되더라고요. 마지막 솔로 장면은 정말 압도적이었습니다.",
    tags: { positive: ["역동적", "경이로움", "에너지"], negative: [], mood: ["강렬한", "해방감"] },
  },
  {
    userEmail: "woosung@demo.tangil",
    text: "이날치 공연은 국악의 새로운 가능성을 보여줬어요. 전통 판소리의 창법을 유지하면서도 현대적 리듬과 결합한 방식이 정말 신선했습니다. 처음엔 낯설었지만 중반부터 완전히 빠져들었어요.",
    tags: { positive: ["흥겨움", "신선함", "에너지"], negative: [], mood: ["신나는", "활기찬"] },
  },
  {
    userEmail: "haerin@demo.tangil",
    text: "배우들이 너무 훌륭했어요. 감정 이입이 자연스럽게 되고 공연이 끝나도 한동안 그 여운이 남아있었어요. 이런 공연이 있다는 걸 딴길 덕분에 알게 됐어요.",
    tags: { positive: ["여운", "감동적", "공감"], negative: [], mood: ["따뜻한", "서정적"] },
  },
];

// ── 메인 ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 딴길 데모 시드 시작...\n");

  // ── 1. 더미 사용자 ────────────────────────────────────────────────────────
  console.log("👤 더미 사용자 생성 중...");
  const userMap = {}; // email → { userId, tasteEmbedding }

  for (const u of DUMMY_USERS) {
    const userId = randomUUID();
    const tasteEmbedding = addNoise(weightedBlend(u.genreWeights));

    const profile = {
      id: userId,
      email: u.email,
      hobbies: u.hobbies,
      tasteEmbedding,
      sensoryTags: u.sensoryTags,
      seenIds: [],
      groupIds: [],
      createdAt: Date.now() - Math.floor(Math.random() * 5) * 86_400_000,
      updatedAt: Date.now(),
    };

    await kv.set(`user:${userId}`, profile);
    await kv.set(`email:${u.email}`, userId);
    userMap[u.email] = { userId, tasteEmbedding };
    console.log(`  ✅ ${u.name} (${u.email})`);
  }

  // ── 2. 그룹 & 메시지 ──────────────────────────────────────────────────────
  console.log("\n👥 그룹 생성 중...");

  for (const g of GROUPS) {
    const groupId = randomUUID();
    const centroidVec = weightedBlend(g.genreWeights);

    await sql`
      INSERT INTO groups (id, name, centroid_embedding, created_at)
      VALUES (
        ${groupId},
        ${g.name},
        ${JSON.stringify(centroidVec)},
        ${daysAgo(3)}
      )
      ON CONFLICT (id) DO NOTHING
    `;
    console.log(`  ✅ 그룹: "${g.name}"`);

    // 멤버 추가
    for (const email of g.memberEmails) {
      const { userId } = userMap[email];
      await sql`
        INSERT INTO group_members (group_id, user_id, joined_at)
        VALUES (${groupId}, ${userId}, ${daysAgo(2)})
        ON CONFLICT (group_id, user_id) DO NOTHING
      `;
      // KV groupIds 업데이트
      const profile = await kv.get(`user:${userId}`);
      if (profile && !profile.groupIds.includes(groupId)) {
        await kv.set(`user:${userId}`, {
          ...profile,
          groupIds: [...profile.groupIds, groupId],
        });
      }
    }
    console.log(`    멤버 ${g.memberEmails.length}명 배정`);

    // 메시지 삽입 (5~25분 간격)
    let msgTime = Date.now() - g.messages.length * 18 * 60 * 1000;
    for (const m of g.messages) {
      const msgId = randomUUID();
      const { userId } = userMap[m.from];
      const createdAt = new Date(msgTime).toISOString();
      msgTime += (Math.floor(Math.random() * 20) + 5) * 60 * 1000;

      await sql`
        INSERT INTO messages (id, group_id, user_id, content, created_at)
        VALUES (${msgId}, ${groupId}, ${userId}, ${m.text}, ${createdAt})
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log(`    메시지 ${g.messages.length}개 삽입`);
  }

  // ── 3. 리뷰 ──────────────────────────────────────────────────────────────
  console.log("\n⭐ 공연 리뷰 생성 중...");

  for (let i = 0; i < REVIEWS.length; i++) {
    const r = REVIEWS[i];
    const perfId = perfIds[i % perfIds.length];
    const { userId } = userMap[r.userEmail];
    const reviewId = randomUUID();
    const createdAt = daysAgo(i + 1);
    const title = contents[perfId]?.title ?? perfId;

    await sql`
      INSERT INTO reviews (id, perf_id, user_id, text, tags_json, created_at)
      VALUES (
        ${reviewId},
        ${perfId},
        ${userId},
        ${r.text},
        ${JSON.stringify(r.tags)},
        ${createdAt}
      )
      ON CONFLICT (id) DO NOTHING
    `;
    console.log(`  ✅ "${title.slice(0, 20)}" — ${r.userEmail.split("@")[0]}`);
  }

  // ── 결과 요약 ─────────────────────────────────────────────────────────────
  console.log("\n✨ 데모 시드 완료!\n");
  console.log("📊 생성된 데이터:");
  console.log(`  • 더미 사용자: ${DUMMY_USERS.length}명`);
  console.log(`  • 그룹: ${GROUPS.length}개`);
  console.log(`  • 채팅 메시지: ${GROUPS.reduce((s, g) => s + g.messages.length, 0)}개`);
  console.log(`  • 공연 리뷰: ${REVIEWS.length}개`);
  console.log("\n🔑 데모 계정 이메일 (로그인 테스트용):");
  for (const u of DUMMY_USERS) {
    console.log(`  ${u.name.padEnd(6)} → ${u.email}`);
  }
}

main().catch(console.error).finally(() => process.exit(0));
