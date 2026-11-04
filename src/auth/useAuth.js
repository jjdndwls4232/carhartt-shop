// ============================================================
// useAuth.js  (auth 폴더 - 새로 만드는 파일)
// 역할: 어느 컴포넌트에서든 const { user, login, logout } = useAuth(); 로
//       로그인 정보와 함수를 꺼내 쓰게 해 주는 커스텀 훅
// ============================================================
import { useContext } from "react";
import { AuthContext } from "./authContext";

export const useAuth = () => {
  const value = useContext(AuthContext);
  // main.jsx 에서 <AuthProvider> 로 감싸지 않은 곳에서 쓰면 바로 알 수 있게 에러를 냄
  if (!value) {
    throw new Error("useAuth 는 <AuthProvider> 안에서만 사용할 수 있습니다.");
  }
  return value;
};
