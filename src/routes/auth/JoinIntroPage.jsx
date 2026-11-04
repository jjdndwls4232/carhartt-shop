// ============================================================
// JoinIntroPage.jsx  (routes/auth 폴더 - 새로 만드는 파일, 경로: /join)
// 역할: 회원가입 첫 화면 (로그인 페이지의 "회원가입" 을 누르면 오는 곳)
//   - "통합 회원가입 하기" → /join/form (회원정보 입력 페이지)
//   - SNS 버튼 → 소셜 로그인 후 바로 홈으로 (별도 가입 절차 없이 간편 가입)
//   - "로그인 하러가기" → /social-login
// ============================================================
import { Link, useNavigate } from "react-router-dom";
import SocialLoginButtons from "../../components/auth/SocialLoginButtons";
import { useAuth } from "../../auth/useAuth";
import "./JoinPage.scss";

const JoinIntroPage = () => {
  const navigate = useNavigate();
  const { socialLogin } = useAuth();

  // 소셜 로그인 성공 → 앱 로그인 처리 후 홈으로
  const handleSocialSuccess = (provider, profile) => {
    socialLogin(provider, profile);
    navigate("/", { replace: true });
  };

  return (
    <div className="join-page join-intro">
      <h1 className="join-title">회원가입을 환영합니다.</h1>
      <p className="join-desc">회원을 위한 특별한 혜택이 기다리고 있습니다.</p>

      <Link to="/join/form" className="join-btn join-btn--primary">
        통합 회원가입 하기
      </Link>

      <p className="join-sns-text">SNS 계정을 통해 간편하게 가입 하실 수 있습니다.</p>
      <SocialLoginButtons onSuccess={handleSocialSuccess} />

      <p className="join-login-link">
        이미 칼하트 회원이신가요?
        <Link to="/social-login">로그인 하러가기</Link>
      </p>
    </div>
  );
};

export default JoinIntroPage;
