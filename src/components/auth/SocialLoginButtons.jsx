// ============================================================
// SocialLoginButtons.jsx  (components/auth 폴더 - 새로 만드는 파일)
// 역할: 네이버 / 카카오 / 구글 동그란 소셜 로그인 버튼 3개
//   원래 SocialLoginPage 안에 있던 SDK 코드를 그대로 옮겨서
//   로그인 페이지와 회원가입 안내 페이지에서 같이 쓸 수 있게 만든 컴포넌트
// props
//   - onSuccess(provider, profile) : 소셜 로그인에 성공하면 실행할 함수
//       provider : "naver" | "kakao" | "google"
//       profile  : { id, name }  (각 SDK 에서 받아온 회원 정보)
// ============================================================
import { useEffect } from "react";
import "./SocialLoginButtons.scss";

const imgPath = import.meta.env.BASE_URL + "img/";

// .env.local 에 넣은 값. Vite 는 VITE_ 로 시작하는 변수만 import.meta.env 로 읽을 수 있음
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;

const SocialLoginButtons = ({ onSuccess }) => {
  // 카카오 SDK 초기화: SDK 가 로드될 때까지 0.1초마다 확인(최대 5초)하고, 초기화되면 종료
  useEffect(() => {
    let timer;
    let tries = 0;

    const initKakao = () => {
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          // 키가 없으면 init 이 에러를 던져 화면 전체가 하얗게 되므로 먼저 확인
          if (!KAKAO_JS_KEY) {
            console.warn(
              "VITE_KAKAO_JS_KEY 가 없습니다. .env.local 을 확인하고 dev 서버를 다시 시작하세요.",
            );
            return;
          }
          window.Kakao.init(KAKAO_JS_KEY); // 카카오 SDK 초기화
        }
        return;
      }
      if (tries < 50) {
        tries += 1;
        timer = setTimeout(initKakao, 100);
      } else {
        console.warn("Kakao SDK 를 불러오지 못했습니다.");
      }
    };

    initKakao();
    return () => clearTimeout(timer); // 페이지를 벗어나면 확인 중단
  }, []);

  // 네이버 로그인 버튼 초기화 + 네이버 로그인 후 돌아온 경우 로그인 처리
  //   네이버는 로그인 후 callbackUrl(/social-login)로 페이지가 이동해서 돌아오므로,
  //   돌아온 페이지에서 getLoginStatus 로 로그인 여부를 확인함
  useEffect(() => {
    if (!window.naver) {
      console.warn("Naver SDK 를 불러오지 못했습니다.");
      return;
    }
    if (!NAVER_CLIENT_ID) {
      console.warn("VITE_NAVER_CLIENT_ID 가 없습니다. .env.local 을 확인하세요.");
      return;
    }

    const naverLoginElement = document.getElementById("naverIdLogin");
    if (naverLoginElement) naverLoginElement.innerHTML = ""; // 기존 버튼 초기화

    // 네이버 로그인 객체 생성 및 초기화
    const naverLoginInstance = new window.naver.LoginWithNaverId({
      clientId: NAVER_CLIENT_ID, // 네이버 클라이언트 ID
      callbackUrl: `${window.location.origin}/social-login`, // 콜백 URL (네이버 개발자센터에 등록한 주소와 같아야 함)
      isPopup: false, // 팝업 여부
      loginButton: { color: "green", type: 3, height: 54 }, // 로그인 버튼 스타일
    });
    naverLoginInstance.init();

    naverLoginInstance.getLoginStatus((status) => {
      if (!status) return;
      // 주소창에 남은 #access_token=... 제거
      window.history.replaceState(null, "", window.location.pathname);
      const naverUser = naverLoginInstance.user;
      onSuccess("naver", {
        id: naverUser?.getId?.(),
        name: naverUser?.getName?.() || naverUser?.getNickName?.() || "네이버 회원",
      });
    });
    // onSuccess 는 페이지마다 새로 만들어지는 함수라서 의존성에 넣으면 매번 다시 초기화됨
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 네이버 로그인 : SDK 가 그린 숨김 버튼(#naverIdLogin 안의 a 태그)을 대신 클릭 */
  const naverLogin = () => {
    document.getElementById("naverIdLogin")?.firstElementChild?.click();
  };

  /** 카카오 로그인 */
  const kakaoLogin = () => {
    if (!window.Kakao?.Auth?.login) {
      alert(
        "카카오 SDK 를 불러오지 못했거나, 팝업 로그인(Kakao.Auth.login)을 지원하지 않는 버전입니다.",
      );
      return;
    }
    window.Kakao.Auth.login({
      scope: "profile_image, profile_nickname", // 요청 권한
      success: () => {
        // 로그인 성공 → 사용자 정보 요청
        window.Kakao.API.request({
          url: "/v2/user/me", // 사용자 정보 API
          success: (res) => {
            onSuccess("kakao", {
              id: res.id,
              name:
                res.kakao_account?.profile?.nickname ||
                res.properties?.nickname ||
                "카카오 회원",
            });
          },
          fail: (error) => {
            alert("카카오 로그인 실패");
            console.error(error);
          },
        });
      },
    });
  };

  /** 구글 로그인 */
  const googleLogin = () => {
    if (!window.google?.accounts) {
      alert("구글 로그인 SDK 를 아직 불러오지 못했습니다. 잠시 후 다시 시도하세요.");
      return;
    }
    // 구글 OAuth2 로그인 요청 (사용자가 로그인에 성공하면 callback 이 호출됨)
    window.google.accounts.oauth2
      .initCodeClient({
        client_id: GOOGLE_CLIENT_ID, // 구글 클라이언트 ID
        scope: "email profile openid", // 요청 권한
        callback: (response) => {
          if (response.error) {
            console.error("Google Login Error:", response.error);
            return;
          }
          // 인가 코드(response.code)만 오기 때문에 이름은 알 수 없음
          //   (코드를 이름/이메일로 바꾸려면 Client Secret 을 가진 서버가 필요)
          onSuccess("google", { id: response.code?.slice(-12), name: "구글 회원" });
        },
      })
      .requestCode(); // Google 인증 서버에 인증 코드를 요청
  };

  return (
    <div className="sns-row">
      {/* 네이버 SDK 가 버튼을 그리는 자리: 화면에서는 숨김 (DOM 에는 있어야 클릭 전달 가능) */}
      <div id="naverIdLogin" className="naver-hidden"></div>
      <button
        type="button"
        className="sns-circle naver"
        onClick={naverLogin}
        aria-label="네이버로 로그인"
      >
        <img src={imgPath + "naverLoginBtn.png"} alt="" />
      </button>

      <button
        type="button"
        className="sns-circle kakao"
        onClick={kakaoLogin}
        aria-label="카카오로 로그인"
      >
        <img src={imgPath + "kakao_login_light.png"} alt="" />
      </button>

      <button
        type="button"
        className="sns-circle google"
        onClick={googleLogin}
        aria-label="구글로 로그인"
      >
        <img src={imgPath + "googleLoginBtn.png"} alt="" />
      </button>
    </div>
  );
};

export default SocialLoginButtons;
