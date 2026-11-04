// ============================================================
// authContext.js  (auth 폴더 - 새로 만드는 파일)
// 역할: 로그인 정보를 앱 전체에 나눠주는 "통로"(Context) 객체
//   AuthProvider 가 값을 넣고, useAuth 로 어느 컴포넌트에서든 꺼내 씀
//   (Provider 컴포넌트와 파일을 나눈 이유 : Vite 의 빠른 새로고침(HMR)은
//    컴포넌트만 내보내는 파일에서 가장 잘 동작하기 때문)
// ============================================================
import { createContext } from "react";

export const AuthContext = createContext(null);
