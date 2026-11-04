import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./SocialLoginPage.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import SocialLoginButtons from "../../components/auth/SocialLoginButtons";
import { useAuth } from "../../auth/useAuth";
import { getSavedId, setSavedId } from "../../auth/userStore";

const SocialLoginPage = () => {
  const navigate = useNavigate();
  // 회원가입 직후 이동해 왔다면 location.state.userId 에 가입한 아이디가 들어 있음
  const location = useLocation();
  const { user, login, logout, socialLogin } = useAuth();
  // 로그인 후 이동할 주소 : 마이페이지처럼 로그인이 필요한 페이지에서 보내왔으면 그 페이지로, 아니면 홈으로
  const redirectTo = location.state?.from ?? "/";

  // 탭: "member"(회원 로그인) | "guest"(비회원 주문조회)
  const [tab, setTab] = useState("member");
  // 비밀번호 보기/숨기기
  const [showPw, setShowPw] = useState(false);

  // 아이디 처음 값 : 회원가입에서 넘어온 아이디 → 없으면 "아이디 저장" 해 둔 아이디
  const savedId = getSavedId();
  const [userId, setUserId] = useState(location.state?.userId ?? savedId);
  const [password, setPassword] = useState("");
  const [keepLogin, setKeepLogin] = useState(false); // 로그인 상태 유지
  const [saveId, setSaveId] = useState(Boolean(savedId)); // 아이디 저장 (저장된 아이디가 있으면 체크된 상태로 시작)
  const [error, setError] = useState(""); // 로그인 실패 안내 문구

  /** 아이디/비밀번호 로그인 */
  const handleLogin = async (e) => {
    e.preventDefault(); // form 제출 시 새로고침 막기
    if (!userId.trim() || !password) {
      setError("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
    const result = await login(userId.trim(), password, keepLogin);
    if (!result.ok) {
      setError(result.message);
      setPassword(""); // 틀렸을 때는 비밀번호만 지움
      return;
    }
    setSavedId(saveId ? userId.trim() : ""); // 아이디 저장 체크 여부에 따라 저장/삭제
    navigate(redirectTo, { replace: true });
  };

  /** 소셜 로그인 성공 → 앱 로그인 처리 후 이동 */
  const handleSocialSuccess = (provider, profile) => {
    socialLogin(provider, profile);
    navigate(redirectTo, { replace: true });
  };

  // ---------- 이미 로그인되어 있는 경우 ----------
  if (user) {
    return (
      <div className="login-page">
        <h1 className="login-title">회원 로그인</h1>
        <p className="login-welcome">
          <strong>{user.nickname || user.name}</strong>님, 이미 로그인되어 있습니다.
        </p>
        <Link to="/" className="submit-btn">
          홈으로
        </Link>
        <button type="button" className="logout-button" onClick={logout}>
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="login-page">
      <h1 className="login-title">
        {tab === "member" ? "회원 로그인" : "비회원 주문조회"}
      </h1>

      {/* 탭 */}
      <div className="login-tabs">
        <button
          type="button"
          className={tab === "member" ? "active" : ""}
          onClick={() => setTab("member")}
        >
          회원 로그인
        </button>
        <button
          type="button"
          className={tab === "guest" ? "active" : ""}
          onClick={() => setTab("guest")}
        >
          비회원 주문조회
        </button>
      </div>

      {tab === "member" ? (
        <>
          {/* 회원 로그인 폼 : form 으로 감싸서 Enter 키로도 로그인 */}
          <form onSubmit={handleLogin} noValidate>
            <div className="field">
              <label htmlFor="userId">아이디</label>
              <input
                id="userId"
                type="text"
                placeholder="아이디를 입력해 주세요"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setError("");
                }}
                autoComplete="username"
              />
            </div>

            <div className="field">
              <label htmlFor="userPw">비밀번호</label>
              <div className="pw-wrap">
                <input
                  id="userPw"
                  type={showPw ? "text" : "password"}
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label="비밀번호 보기"
                >
                  {showPw ? (
                    <FontAwesomeIcon icon={faEye} />
                  ) : (
                    <FontAwesomeIcon icon={faEyeSlash} />
                  )}
                </button>
              </div>
            </div>

            <div className="check-row">
              <label className="check">
                <input
                  type="checkbox"
                  checked={keepLogin}
                  onChange={(e) => setKeepLogin(e.target.checked)}
                />
                <span className="box" />
                로그인 상태 유지
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={saveId}
                  onChange={(e) => setSaveId(e.target.checked)}
                />
                <span className="box" />
                아이디 저장
              </label>
            </div>

            {/* role="alert" : 문구가 생기면 스크린리더가 바로 읽어줌 */}
            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="submit-btn">
              로그인
            </button>
          </form>

          <ul className="sub-links">
            <li>
              <Link to="/join">회원가입</Link>
            </li>
            <li>아이디 찾기</li>
            <li>비밀번호 찾기</li>
          </ul>

          <p className="sns-text">
            가입한 SNS 계정을 통해 빠르게 로그인 하실 수 있습니다.
          </p>

          {/* 소셜 로그인 (네이버 / 카카오 / 구글) */}
          <SocialLoginButtons onSuccess={handleSocialSuccess} />
        </>
      ) : (
        <>
          {/* 비회원 주문조회 폼 */}
          <div className="field">
            <label htmlFor="orderName">주문자명</label>
            <input
              id="orderName"
              type="text"
              placeholder="주문자명을 입력해 주세요"
            />
          </div>
          <div className="field">
            <label htmlFor="orderNo">주문번호</label>
            <input
              id="orderNo"
              type="text"
              placeholder="주문번호를 입력해 주세요"
            />
          </div>

          <button type="button" className="submit-btn">
            주문조회
          </button>

          <p className="notice-box">
            주문번호를 잊으신 경우, 고객센터로 문의해 주시기 바랍니다.
          </p>
          <div className="cs-box">고객센터 1660-2034</div>
        </>
      )}
    </div>
  );
};

export default SocialLoginPage;
