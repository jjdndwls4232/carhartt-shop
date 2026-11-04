// ============================================================
// userStore.js  (auth 폴더 - 새로 만드는 파일)
// 역할: 회원 정보와 로그인 정보를 브라우저 저장소에 읽고 쓰는 함수 모음
//   서버가 없어서 회원 목록을 localStorage 에 저장함
//   → 같은 브라우저에서만 유지되고, 다른 기기/브라우저에서는 보이지 않음
//   (서버가 생기면 이 파일의 함수들만 서버 요청으로 바꾸면 됨)
// ============================================================

// 저장소에서 쓰는 이름(key)
const USERS_KEY = "carhartt.users"; // 가입한 회원 목록
const SESSION_KEY = "carhartt.session"; // 지금 로그인한 회원
const SAVED_ID_KEY = "carhartt.savedId"; // "아이디 저장" 을 체크했을 때의 아이디

// localStorage 는 막혀 있는 환경(사생활 보호 모드 등)에서 에러를 던질 수 있어서
// 읽기/쓰기를 try/catch 로 감쌈
const readJSON = (storage, key, fallback) => {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (storage, key, value) => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장이 안 되는 환경이면 조용히 무시 (이번 접속 동안만 로그인 유지)
  }
};

const removeKey = (storage, key) => {
  try {
    storage.removeItem(key);
  } catch {
    // 무시
  }
};

// ------------------------------------------------------------
// 비밀번호 암호화(해시)
//   비밀번호를 그대로 저장하지 않고, 되돌릴 수 없는 문자열(해시)로 바꿔서 저장
//   로그인할 때는 입력한 비밀번호도 똑같이 바꿔서 저장된 값과 비교함
//   crypto.subtle 은 https 나 localhost 에서만 동작해서, 없으면 간단한 해시로 대체
// ------------------------------------------------------------
export const hashPassword = async (password) => {
  const text = `carhartt:${password}`;
  if (window.crypto?.subtle) {
    const bytes = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    // 결과(바이트 배열)를 16진수 문자열로 바꿈
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // 대체 해시 (djb2) : 보안용은 아니지만 비밀번호 원문이 그대로 남지 않게 함
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i); // hash × 33 ^ 글자코드 (32비트 정수로 유지)
  }
  return `djb2-${(hash >>> 0).toString(16)}`;
};

// ---------- 회원 목록 ----------
export const getUsers = () => readJSON(localStorage, USERS_KEY, []);

export const findUser = (userId) =>
  getUsers().find((user) => user.userId === userId);

export const isUserIdTaken = (userId) => Boolean(findUser(userId));

export const saveUser = (user) => {
  writeJSON(localStorage, USERS_KEY, [...getUsers(), user]);
};

// ---------- 로그인 세션 ----------
// keepLogin(로그인 상태 유지)
//   true  → localStorage   : 브라우저를 껐다 켜도 로그인 유지
//   false → sessionStorage : 탭/브라우저를 닫으면 로그아웃
export const saveSession = (session, keepLogin) => {
  clearSession();
  writeJSON(keepLogin ? localStorage : sessionStorage, SESSION_KEY, session);
};

export const loadSession = () =>
  readJSON(localStorage, SESSION_KEY, null) ??
  readJSON(sessionStorage, SESSION_KEY, null);

export const clearSession = () => {
  removeKey(localStorage, SESSION_KEY);
  removeKey(sessionStorage, SESSION_KEY);
};

// ---------- 아이디 저장 ----------
export const getSavedId = () => readJSON(localStorage, SAVED_ID_KEY, "");

export const setSavedId = (userId) => {
  if (userId) writeJSON(localStorage, SAVED_ID_KEY, userId);
  else removeKey(localStorage, SAVED_ID_KEY);
};
