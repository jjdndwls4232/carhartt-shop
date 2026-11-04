// ============================================================
// JoinFormPage.jsx  (routes/auth 폴더 - 새로 만드는 파일, 경로: /join/form)
// 역할: 회원정보 입력 + 약관동의 → 가입완료
//   위에서 아래 순서 : 기본정보(아이디 ~ 성별) → 약관동의 → 가입완료 버튼
//   입력값 검사(validate) 를 통과하면 AuthProvider 의 signup 으로 회원을 저장하고
//   로그인 페이지로 이동 (가입한 아이디를 미리 채워 줌)
// ============================================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../auth/useAuth";
import { isUserIdTaken } from "../../auth/userStore";
import { JOIN_TERMS } from "../../components/auth/joinTerms";
import "./JoinPage.scss";

// 이메일 도메인 선택 옵션 ("direct" = 직접입력)
const EMAIL_DOMAINS = ["naver.com", "gmail.com", "daum.net", "kakao.com", "nate.com"];

// 다음(카카오) 우편번호 검색 스크립트 주소 (무료, 키 필요 없음)
const POSTCODE_SCRIPT =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

// 입력칸들의 처음 값
const INITIAL_FORM = {
  userId: "",
  password: "",
  passwordConfirm: "",
  name: "",
  nickname: "",
  emailId: "",
  emailDomain: "",
  emailSelect: "direct",
  agreeEmail: false,
  phone: "",
  agreeSms: false,
  zipcode: "",
  address: "",
  addressDetail: "",
  birth: "",
  gender: "",
};

// 약관 동의 처음 값 : { age: false, service: false, privacy: false, marketing: false }
const INITIAL_AGREES = Object.fromEntries(JOIN_TERMS.map((term) => [term.key, false]));

// 오늘 날짜 "2026-11-02" (생일 입력칸의 최대값)
const today = new Date().toISOString().slice(0, 10);

// ------------------------------------------------------------
// 입력값 검사 : 문제가 있는 칸만 { 칸이름: "안내 문구" } 로 돌려줌 (문제가 없으면 빈 객체)
// ------------------------------------------------------------
const validate = (form, agrees) => {
  const errors = {};

  if (!/^[a-z0-9]{4,16}$/.test(form.userId)) {
    errors.userId = "영문 소문자, 숫자 4~16자로 입력해 주세요.";
  } else if (isUserIdTaken(form.userId)) {
    errors.userId = "이미 사용 중인 아이디입니다.";
  }

  // 영문 / 숫자 / 특수문자 중 몇 종류를 썼는지 셈 (true 는 1, false 는 0 으로 더해짐)
  const kinds =
    /[A-Za-z]/.test(form.password) +
    /[0-9]/.test(form.password) +
    /[^A-Za-z0-9]/.test(form.password);
  if (form.password.length < 10 || form.password.length > 20 || kinds < 2) {
    errors.password = "영문, 숫자, 특수문자 중 2종류 이상 조합하여 10~20자로 입력해 주세요.";
  }
  if (!form.passwordConfirm || form.passwordConfirm !== form.password) {
    errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
  }

  if (form.name.trim().length < 2) errors.name = "이름을 입력해 주세요.";
  if (form.nickname.trim().length < 2) errors.nickname = "닉네임을 2자 이상 입력해 주세요.";

  // 이메일은 선택이지만, 쓰기 시작했다면 형식이 맞아야 함
  if (form.emailId || form.emailDomain) {
    const email = `${form.emailId}@${form.emailDomain}`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "올바른 이메일 주소를 입력해 주세요.";
    }
  }

  if (!/^01[0-9]{8,9}$/.test(form.phone)) {
    errors.phone = "휴대폰 번호를 숫자만 정확히 입력해 주세요.";
  }
  if (!form.birth || form.birth > today) errors.birth = "생일을 입력해 주세요.";
  if (!form.gender) errors.gender = "성별을 선택해 주세요.";

  if (JOIN_TERMS.some((term) => term.required && !agrees[term.key])) {
    errors.terms = "필수 약관에 모두 동의해 주세요.";
  }
  return errors;
};

// ------------------------------------------------------------
// 입력칸 한 줄 (라벨 + 입력칸 + 안내/에러 문구)을 그리는 작은 컴포넌트
// ------------------------------------------------------------
const Field = ({ id, label, required, error, hint, children }) => (
  <div className={`join-field${error ? " has-error" : ""}`}>
    <label htmlFor={id} className="join-label">
      {label}
      {required && <span className="join-required"> *</span>}
    </label>
    {children}
    {/* 에러가 있으면 에러를, 없으면 안내 문구(hint)를 보여줌 */}
    {error ? (
      <p className="join-msg join-msg--error" id={`${id}-msg`}>
        {error}
      </p>
    ) : (
      hint && (
        <p className="join-msg" id={`${id}-msg`}>
          {hint}
        </p>
      )
    )}
  </div>
);

const JoinFormPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  // ---------- state ----------
  const [form, setForm] = useState(INITIAL_FORM); // 입력값 전체
  const [agrees, setAgrees] = useState(INITIAL_AGREES); // 약관 동의 여부
  const [touched, setTouched] = useState({}); // 한 번이라도 입력했다가 벗어난 칸 { userId: true, ... }
  const [submitted, setSubmitted] = useState(false); // 가입완료를 한 번이라도 눌렀는지
  const [showPw, setShowPw] = useState(false); // 비밀번호 보기
  const [showPwConfirm, setShowPwConfirm] = useState(false); // 비밀번호 재입력 보기
  const [saving, setSaving] = useState(false); // 저장 중 (버튼 두 번 클릭 방지)
  const [serverError, setServerError] = useState(""); // signup 이 돌려준 에러

  // 매 렌더링마다 지금 입력값으로 검사 → 에러 목록
  const errors = validate(form, agrees);
  const isValid = Object.keys(errors).length === 0;

  // 칸을 벗어났거나(touched) 가입완료를 눌렀을 때만 에러를 보여줌
  //   (처음 들어오자마자 빨간 글씨가 가득 보이지 않게)
  const errorOf = (key) => (touched[key] || submitted ? errors[key] : undefined);

  // ---------- 입력 핸들러 ----------
  // 칸 이름(key)과 값을 받아서 form 의 그 칸만 바꿈
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // input 의 name 속성을 칸 이름으로 사용 → 핸들러 하나로 여러 칸 처리
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setField(name, type === "checkbox" ? checked : value);
  };

  const handleBlur = (e) => setTouched((prev) => ({ ...prev, [e.target.name]: true }));

  // 휴대폰 번호 : 숫자가 아닌 글자(-, 공백 등)는 지우고 최대 11자리까지만
  //   (input 의 maxLength 를 쓰면 "010-1234-5678" 처럼 - 를 넣었을 때 숫자가 잘려서 직접 자름)
  const handlePhoneChange = (e) =>
    setField("phone", e.target.value.replace(/\D/g, "").slice(0, 11));

  // 이메일 도메인 선택 : "직접입력" 이 아니면 도메인 칸을 선택한 값으로 채움
  const handleEmailSelect = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      emailSelect: value,
      emailDomain: value === "direct" ? "" : value,
    }));
  };

  // ---------- 우편번호 검색 ----------
  // 스크립트를 처음 누를 때만 불러와서(지연 로딩) 페이지 첫 로딩을 가볍게 함
  const loadPostcode = () =>
    new Promise((resolve, reject) => {
      if (window.daum?.Postcode) return resolve();
      const script = document.createElement("script");
      script.src = POSTCODE_SCRIPT;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });

  const openPostcode = async () => {
    try {
      await loadPostcode();
    } catch {
      alert("우편번호 검색을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    new window.daum.Postcode({
      // 주소를 고르면 실행 : data.zonecode = 우편번호, roadAddress = 도로명 주소
      oncomplete: (data) => {
        setForm((prev) => ({
          ...prev,
          zipcode: data.zonecode,
          address: data.roadAddress || data.jibunAddress,
        }));
        document.getElementById("addressDetail")?.focus(); // 상세 주소로 바로 이동
      },
    }).open();
  };

  // ---------- 약관 ----------
  const allAgreed = JOIN_TERMS.every((term) => agrees[term.key]);

  // 전체동의 : 모든 항목을 한꺼번에 체크/해제
  const handleAgreeAll = (e) => {
    const checked = e.target.checked;
    setAgrees(Object.fromEntries(JOIN_TERMS.map((term) => [term.key, checked])));
  };

  const handleAgree = (key) => (e) =>
    setAgrees((prev) => ({ ...prev, [key]: e.target.checked }));

  // ---------- 가입완료 ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");

    if (!isValid) {
      // 첫 번째 에러 칸으로 스크롤 + 포커스
      const firstKey = Object.keys(errors)[0];
      const target =
        firstKey === "email"
          ? "emailId"
          : firstKey === "gender"
            ? "gender-male"
            : firstKey === "terms"
              ? "agreeAll"
              : firstKey;
      document.getElementById(target)?.focus();
      return;
    }

    setSaving(true);
    const result = await signup({
      userId: form.userId,
      password: form.password,
      name: form.name.trim(),
      nickname: form.nickname.trim(),
      email: form.emailId ? `${form.emailId}@${form.emailDomain}` : "",
      phone: form.phone,
      zipcode: form.zipcode,
      address: form.address,
      addressDetail: form.addressDetail.trim(),
      birth: form.birth,
      gender: form.gender,
      agreements: {
        ...agrees,
        email: form.agreeEmail,
        sms: form.agreeSms,
      },
    });
    setSaving(false);

    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    alert("회원가입이 완료되었습니다. 로그인해 주세요.");
    // state : 다음 페이지로 몰래 넘겨주는 값 → 로그인 페이지에서 아이디를 미리 채움
    navigate("/social-login", { replace: true, state: { userId: form.userId } });
  };

  return (
    <div className="join-page join-form-page">
      <h1 className="join-title">회원가입</h1>
      <p className="join-desc">회원을 위한 특별한 혜택이 기다리고 있습니다.</p>

      {/* noValidate : 브라우저 기본 검사 말풍선 대신 우리가 만든 안내 문구를 사용 */}
      <form className="join-form" onSubmit={handleSubmit} noValidate>
        {/* ==================== 기본정보 ==================== */}
        <div className="join-section-head">
          <h2>기본정보</h2>
          <span>
            <em>*</em>필수 입력 항목입니다
          </span>
        </div>

        <Field id="userId" label="아이디" required error={errorOf("userId")}>
          <input
            id="userId"
            name="userId"
            className="join-input"
            value={form.userId}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="아이디를 입력해 주세요."
            autoComplete="username"
            maxLength={16}
            aria-invalid={Boolean(errorOf("userId"))}
            aria-describedby="userId-msg"
          />
        </Field>

        <Field
          id="password"
          label="비밀번호"
          required
          error={errorOf("password")}
          hint="영문(대소문자 구분), 숫자, 특수문자 중 2종류 이상을 조합하여 최소 10자리 이상으로 설정해 주세요."
        >
          <div className="join-pw">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              className="join-input"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="비밀번호를 입력해 주세요."
              autoComplete="new-password"
              maxLength={20}
              aria-invalid={Boolean(errorOf("password"))}
              aria-describedby="password-msg"
            />
            <button
              type="button"
              className="join-eye"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              <FontAwesomeIcon icon={showPw ? faEye : faEyeSlash} />
            </button>
          </div>
        </Field>

        <Field
          id="passwordConfirm"
          label="비밀번호 재입력"
          required
          error={errorOf("passwordConfirm")}
        >
          <div className="join-pw">
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type={showPwConfirm ? "text" : "password"}
              className="join-input"
              value={form.passwordConfirm}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="비밀번호를 재입력 해주세요."
              autoComplete="new-password"
              maxLength={20}
              aria-invalid={Boolean(errorOf("passwordConfirm"))}
              aria-describedby="passwordConfirm-msg"
            />
            <button
              type="button"
              className="join-eye"
              onClick={() => setShowPwConfirm((v) => !v)}
              aria-label={showPwConfirm ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              <FontAwesomeIcon icon={showPwConfirm ? faEye : faEyeSlash} />
            </button>
          </div>
        </Field>

        <Field id="name" label="이름" required error={errorOf("name")}>
          <input
            id="name"
            name="name"
            className="join-input"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="이름을 입력해 주세요."
            autoComplete="name"
            maxLength={20}
          />
        </Field>

        <Field id="nickname" label="닉네임" required error={errorOf("nickname")}>
          <input
            id="nickname"
            name="nickname"
            className="join-input"
            value={form.nickname}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="닉네임을 입력해 주세요."
            maxLength={12}
          />
        </Field>

        {/* 이메일 : 아이디 @ 도메인 + 도메인 선택 */}
        <Field id="emailId" label="이메일" error={errorOf("email")}>
          <div className="join-email">
            <input
              id="emailId"
              name="emailId"
              className="join-input"
              value={form.emailId}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              placeholder="이메일을 입력해 주세요."
              autoComplete="off"
            />
            <span className="join-email-at">@</span>
            <input
              name="emailDomain"
              className="join-input"
              value={form.emailDomain}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              // 목록에서 도메인을 고르면 직접 수정하지 못하게 잠금
              readOnly={form.emailSelect !== "direct"}
              aria-label="이메일 도메인"
            />
          </div>
          <div className="join-select">
            <select
              value={form.emailSelect}
              onChange={handleEmailSelect}
              aria-label="이메일 도메인 선택"
            >
              <option value="direct">직접입력</option>
              {EMAIL_DOMAINS.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
            <FontAwesomeIcon icon={faChevronDown} className="join-select-icon" />
          </div>
        </Field>
        <label className="join-check join-check--sub">
          <input
            type="checkbox"
            name="agreeEmail"
            checked={form.agreeEmail}
            onChange={handleChange}
          />
          <span className="join-check-box" />
          [선택] 정보/이벤트 메일 수신에 동의합니다.
        </label>

        <Field id="phone" label="휴대폰 번호" required error={errorOf("phone")}>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric" // 모바일에서 숫자 키패드
            className="join-input"
            value={form.phone}
            onChange={handlePhoneChange}
            onBlur={handleBlur}
            placeholder="'-' 없이 숫자만 입력해 주세요."
            autoComplete="tel"
          />
        </Field>
        <label className="join-check join-check--sub">
          <input
            type="checkbox"
            name="agreeSms"
            checked={form.agreeSms}
            onChange={handleChange}
          />
          <span className="join-check-box" />
          [선택] 정보/이벤트 SMS 수신에 동의합니다.
        </label>

        {/* 주소 : 우편번호 검색으로만 기본 주소를 채우고, 상세 주소는 직접 입력 */}
        <Field id="address" label="주소">
          <div className="join-address">
            <input
              id="address"
              className="join-input"
              value={form.zipcode ? `(${form.zipcode}) ${form.address}` : ""}
              placeholder="기본 주소"
              readOnly
              onClick={openPostcode}
            />
            <button type="button" className="join-btn join-btn--small" onClick={openPostcode}>
              우편번호 검색
            </button>
          </div>
          <input
            id="addressDetail"
            name="addressDetail"
            className="join-input"
            value={form.addressDetail}
            onChange={handleChange}
            placeholder="상세 주소"
            autoComplete="address-line2"
          />
        </Field>

        <Field id="birth" label="생일" required error={errorOf("birth")}>
          <input
            id="birth"
            name="birth"
            type="date"
            className="join-input"
            value={form.birth}
            onChange={handleChange}
            onBlur={handleBlur}
            max={today}
          />
        </Field>

        {/* 성별 : 라디오 버튼을 숨기고 라벨을 버튼 모양으로 꾸밈 */}
        <div className={`join-field${errorOf("gender") ? " has-error" : ""}`}>
          <span className="join-label">
            성별<span className="join-required"> *</span>
          </span>
          <div className="join-gender" role="radiogroup" aria-label="성별">
            {[
              { value: "male", label: "남자" },
              { value: "female", label: "여자" },
            ].map((option) => (
              <label key={option.value}>
                <input
                  id={`gender-${option.value}`}
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={form.gender === option.value}
                  onChange={handleChange}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {errorOf("gender") && (
            <p className="join-msg join-msg--error">{errorOf("gender")}</p>
          )}
        </div>

        {/* ==================== 약관동의 ==================== */}
        <div className="join-section-head join-section-head--terms">
          <h2>약관동의</h2>
        </div>

        <label className="join-check join-check--all">
          <input
            id="agreeAll"
            type="checkbox"
            checked={allAgreed}
            onChange={handleAgreeAll}
          />
          <span className="join-check-box" />
          칼하트의 모든 약관을 확인하고 전체 동의합니다. (전체동의, 선택항목도 포함됩니다.)
        </label>

        {JOIN_TERMS.map((term) => (
          <div key={term.key} className="join-term">
            <label className="join-check">
              <input
                type="checkbox"
                checked={agrees[term.key]}
                onChange={handleAgree(term.key)}
              />
              <span className="join-check-box" />
              <span className={term.required ? "join-term-required" : "join-term-optional"}>
                ({term.required ? "필수" : "선택"})
              </span>
              {term.label}
            </label>
            {/* 본문이 있는 약관만 스크롤 박스로 보여줌 (tabIndex : 키보드로도 스크롤 가능) */}
            {term.content && (
              <div className="join-term-box" tabIndex={0} aria-label={`${term.label} 본문`}>
                {term.content}
              </div>
            )}
          </div>
        ))}
        {errorOf("terms") && <p className="join-msg join-msg--error">{errorOf("terms")}</p>}

        {serverError && <p className="join-msg join-msg--error join-server-error">{serverError}</p>}

        {/* 입력이 모두 맞으면(isValid) 검은 버튼, 아니면 회색 버튼 */}
        <button
          type="submit"
          className={`join-btn join-submit${isValid ? " is-ready" : ""}`}
          disabled={saving}
        >
          {saving ? "처리 중..." : "가입완료"}
        </button>
      </form>
    </div>
  );
};

export default JoinFormPage;
