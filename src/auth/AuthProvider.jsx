// ============================================================
// AuthProvider.jsx  (auth 폴더 - 새로 만드는 파일)
// 역할: 앱 전체의 "로그인 두뇌"
//   - 지금 로그인한 회원(user)을 state 로 기억
//   - 회원가입(signup) / 로그인(login) / 소셜 로그인(socialLogin) / 로그아웃(logout) 함수 제공
//   main.jsx 에서 <App /> 을 감싸서, 모든 페이지가 useAuth() 로 같은 값을 보게 함
// ============================================================
import { useState, useMemo, useCallback } from "react";
import { AuthContext } from "./authContext";
import {
  findUser,
  isUserIdTaken,
  saveUser,
  hashPassword,
  saveSession,
  loadSession,
  clearSession,
} from "./userStore";

export const AuthProvider = ({ children }) => {
  // 새로고침해도 로그인이 풀리지 않도록, 처음 값을 저장소에서 읽어옴
  //   useState(함수) : 처음 렌더링할 때 한 번만 실행됨
  const [user, setUser] = useState(() => loadSession());

  // ---------- 회원가입 ----------
  // form : 회원가입 페이지에서 넘겨준 입력값
  // 돌려주는 값 : { ok: true } 또는 { ok: false, message: "이유" }
  const signup = useCallback(async (form) => {
    if (isUserIdTaken(form.userId)) {
      return { ok: false, message: "이미 사용 중인 아이디입니다." };
    }
    const { password, ...rest } = form; // 비밀번호 원문은 따로 빼서 저장하지 않음
    saveUser({
      ...rest,
      passwordHash: await hashPassword(password),
      provider: "local",
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  }, []);

  // ---------- 아이디/비밀번호 로그인 ----------
  const login = useCallback(async (userId, password, keepLogin) => {
    const found = findUser(userId);
    // 아이디가 없는지 비밀번호가 틀렸는지 구분해서 알려주지 않음 (아이디 존재 여부 노출 방지)
    if (!found || found.passwordHash !== (await hashPassword(password))) {
      return { ok: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." };
    }
    // 세션에는 화면에 필요한 정보만 담음 (비밀번호 해시는 넣지 않음)
    const session = {
      userId: found.userId,
      name: found.name,
      nickname: found.nickname,
      provider: "local",
    };
    saveSession(session, keepLogin);
    setUser(session);
    return { ok: true };
  }, []);

  // ---------- 소셜 로그인 (네이버 / 카카오 / 구글) ----------
  // profile : { id, name } - 각 SDK 에서 받아온 회원 정보
  const socialLogin = useCallback((provider, profile) => {
    const session = {
      userId: `${provider}:${profile.id ?? "unknown"}`,
      name: profile.name,
      nickname: profile.name,
      provider,
    };
    saveSession(session, false); // 소셜 로그인은 브라우저를 닫으면 로그아웃
    setUser(session);
  }, []);

  // ---------- 로그아웃 ----------
  const logout = useCallback(() => {
    // 소셜 SDK 쪽에 남아 있는 로그인 정보도 함께 정리
    if (window.Kakao?.Auth?.getAccessToken?.()) {
      window.Kakao.Auth.logout(() => {});
    }
    // 네이버 SDK 가 브라우저에 저장한 로그인 정보 삭제
    //   (네이버 서버의 토큰까지 폐기하려면 Client Secret 이 필요해서 백엔드가 있어야 함)
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("com.naver.nid"))
        .forEach((key) => localStorage.removeItem(key));
    } catch {
      // 저장소 접근이 막힌 환경이면 무시
    }
    clearSession();
    setUser(null);
  }, []);

  // useMemo : user 가 바뀔 때만 새 객체를 만들어서, 쓰는 쪽이 쓸데없이 다시 렌더링되지 않게 함
  const value = useMemo(
    () => ({ user, signup, login, socialLogin, logout }),
    [user, signup, login, socialLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
