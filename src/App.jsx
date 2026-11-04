import "./App.css";
import Header from "./components/common/Header";

import { Routes, Route } from "react-router";
import Home from "./routes/Home";
import Goods from "./routes/Goods";
import SocialLoginPage from "./routes/auth/SocialLoginPage";
import JoinIntroPage from "./routes/auth/JoinIntroPage";
import JoinFormPage from "./routes/auth/JoinFormPage";
import MyPage from "./routes/mypage/MyPage";
import BoardListPage from "./routes/board/BoardListPage";
import BoardDetailPage from "./routes/board/BoardDetailPage";
import BoardWritePage from "./routes/board/BoardWritePage";

import Footer from "./components/common/Footer";
function App() {
  return (
    <div>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/goods" element={<Goods />} />
        <Route path="/social-login" element={<SocialLoginPage />} />
        {/* 회원가입 : 안내 페이지 → 회원정보 입력 페이지 */}
        <Route path="/join" element={<JoinIntroPage />} />
        <Route path="/join/form" element={<JoinFormPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/board-list" element={<BoardListPage />} />
        <Route path="/board-list/:id" element={<BoardDetailPage />} />
        <Route path="/board-list/write" element={<BoardWritePage />} />
        <Route path="/board-list/edit/:id" element={<BoardWritePage />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
