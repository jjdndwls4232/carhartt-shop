// useState는 열린 메뉴를 기억하고, useEffect는 외부 클릭 이벤트를 관리
// useRef는 실제 header 요소가 어디인지 기억하는 데 사용
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import { useAuth } from "../../auth/useAuth";
//src/img
import logo from "../../img/logo_carhartt.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faMagnifyingGlass,
  faUser,
  faBars,
  faXmark,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

// ----------------------------------------------------
// [컴포넌트 분리] 일반 텍스트 링크용 서브 메뉴 컴포넌트
// ----------------------------------------------------
const CommonDropdown = ({ items, onClose }) => {
  return (
    <ul className="capsule-sub-menu">
      {/* map : items 배열의 각 항목을 메뉴 한 줄의 JSX로 바꿈 */}
      {items.map((subItem, subIndex) => (
        <li key={subIndex} className="capsule-sub-item">
          <Link
            to={`/goods/${subItem.toLowerCase()}`}
            className="capsule-sub-text"
            onClick={onClose} // 클릭 시 드롭다운 닫기
          >
            {subItem}
          </Link>
          {subIndex < items.length - 1 && (
            <span className="menu-divider">•</span>
          )}
        </li>
      ))}
    </ul>
  );
};

// ----------------------------------------------------
// 💡 [컴포넌트 분리] 2. LOOK BOOK 전용 이미지형 서브 메뉴 컴포넌트
// ----------------------------------------------------
const LookbookDropdown = ({ onClose }) => {
  // 드롭다운에 표시할 제목과 이미지 주소를 배열로 관리합니다.
  const lookbookData = [
    {
      title: "2026 FW COLLECTION",
      img: "https://i.pinimg.com/1200x/ef/8e/9a/ef8e9a253759da2ea75d0cd97fb27b14.jpg",
    },
    {
      title: "2026 SS COLLECTION",
      img: "https://i.pinimg.com/736x/da/a1/02/daa102d7dedecde1f050fab34893fc1d.jpg",
    },
    {
      title: "ARCHIVE YOUTH",
      img: "https://i.pinimg.com/1200x/40/40/7b/40407bee0ac37182043fbe9acb08ddaa.jpg",
    },
  ];

  return (
    <div className="lookbook-dropdown-wrap">
      {lookbookData.map((item, index) => (
        <Link
          to={`/lookbook/${index}`}
          key={index}
          className="lookbook-item"
          onClick={onClose} // 👈 클릭 시 드롭다운 닫기
        >
          <img src={item.img} alt={item.title} className="lookbook-img" />
          <span className="lookbook-title">{item.title}</span>
        </Link>
      ))}
    </div>
  );
};

// ----------------------------------------------------
// 💡 [컴포넌트 분리] 3. 검색창 전용 서브 메뉴 컴포넌트 (onClose 추가 🎯)
// ----------------------------------------------------
const SearchDropdownContent = ({ onClose }) => {
  // navigate는 버튼/함수 안에서 다른 경로로 이동할 때 쓰는 함수
  const navigate = useNavigate();
  // input에 입력 중인 값을 저장하는 state입니다.
  const [keyword, setKeyword] = useState("");

  const handleSearchSubmit = (e) => {
    // form 제출 시 기본 새로고침을 막아 React 화면 흐름을 유지
    e.preventDefault();
    // 공백만 입력한 경우에는 검색 페이지로 이동하지 않게
    if (!keyword.trim()) return;

    // 검색 페이지로 이동 후 드롭다운 닫기
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
    onClose();
  };

  return (
    <div className="search-dropdown-bar">
      <form onSubmit={handleSearchSubmit} className="search-input-box">
        <input
          type="text"
          placeholder="검색어를 입력하세요..."
          className="dropdown-search-input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          autoFocus
        />
        <button type="submit" className="dropdown-search-submit">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </form>
    </div>
  );
};

// ----------------------------------------------------
// 💡 [컴포넌트 분리] 4. 유저 전용 세로 나열 서브 메뉴 컴포넌트
// ----------------------------------------------------
const UserDropdownContent = ({ onClose }) => {
  // user : 로그인한 회원 정보 (로그인 안 했으면 null)
  const { user, logout } = useAuth();

  // 로그인 전 : 로그인 / 회원가입, 마이페이지
  //   마이페이지는 MyPage 가 로그인 여부를 검사해서 로그인 페이지로 보냄
  if (!user) {
    return (
      <ul className="user-vertical-menu">
        <li>
          <Link to="/social-login" onClick={onClose}>
            로그인 / 회원가입
          </Link>
        </li>
        <li>
          <Link to="/mypage" onClick={onClose}>
            마이페이지
          </Link>
        </li>
      </ul>
    );
  }

  // 로그인 후 : 회원 이름 / 마이페이지 / 로그아웃
  return (
    <ul className="user-vertical-menu">
      <li className="user-greeting">{user.nickname || user.name}님</li>
      <li>
        <Link to="/mypage" onClick={onClose}>
          마이페이지
        </Link>
      </li>
      <li>
        <button
          type="button"
          className="user-logout"
          onClick={() => {
            logout();
            onClose(); // 로그아웃 후 드롭다운 닫기
          }}
        >
          로그아웃
        </button>
      </li>
    </ul>
  );
};

// ----------------------------------------------------
// 모바일 메뉴 데이터 (데스크톱 드롭다운과 같은 링크 규칙 사용)
// ----------------------------------------------------
const toGoods = (labels) =>
  labels.map((label) => ({ label, to: `/goods/${label.toLowerCase()}` }));

const MOBILE_MENU = [
  {
    label: "MEN",
    sub: toGoods(["ALL", "NEW", "JACKETS", "KNITWEAR", "TOPS", "BOTTOMS"]),
  },
  {
    label: "WOMEN",
    sub: toGoods(["ALL", "NEW", "JACKETS", "SHIRTING", "DRESSES"]),
  },
  {
    label: "ACCESSORIES",
    sub: toGoods(["ALL", "HATS", "BAGS", "BELTS", "SOCKS"]),
  },
  {
    label: "LOOK BOOK",
    sub: [
      { label: "2026 FW COLLECTION", to: "/lookbook/0" },
      { label: "2026 SS COLLECTION", to: "/lookbook/1" },
      { label: "ARCHIVE YOUTH", to: "/lookbook/2" },
    ],
  },
  {
    label: "SHOP",
    sub: toGoods(["STORES", "NEWS"]),
  },
  {
    label: "NOTICE",
    sub: toGoods(["NOTICE", "FAQ", "INQUIRY"]),
  },
];

// ----------------------------------------------------
// 메인 Header 컴포넌트
// ----------------------------------------------------
const Header = () => {
  // null이면 메뉴가 닫힌 상태, 문자열이면 해당 메뉴가 열린 상태입니다.
  const [activeMenu, setActiveMenu] = useState(null);
  // 모바일 메뉴 열림 여부 / 펼쳐진 모바일 서브메뉴
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSub, setMobileSub] = useState(null);
  // 장바구니처럼 코드에서 페이지 이동을 실행할 때 사용합니다.
  const navigate = useNavigate();
  // 헤더 바깥을 눌렀는지 판별할 수 있도록 header DOM 요소를 보관
  const headerRef = useRef(null);
  // 현재 경로 (페이지 이동 감지용)
  const location = useLocation();

  // 드롭다운(모바일 메뉴 포함)을 닫는 핸들러 함수
  const closeMenu = () => {
    setActiveMenu(null);
    setMobileOpen(false);
    setMobileSub(null);
  };

  // 페이지가 이동하면(경로/검색어 변경) 열려 있던 드롭다운을 모두 닫기
  //   직전 주소를 state 로 기억해 두고, 렌더링 중에 주소가 달라졌으면 바로 닫음
  //   (useEffect 안에서 setState 를 하면 한 번 더 렌더링되기 때문에 React 가 권장하는 방식)
  const currentPath = location.pathname + location.search;
  const [prevPath, setPrevPath] = useState(currentPath);
  if (prevPath !== currentPath) {
    setPrevPath(currentPath);
    closeMenu();
  }

  // 우측 아이콘 전용 클릭 토글 함수
  const handleIconClick = (menuName) => {
    setMobileOpen(false); // 검색/유저를 열 땐 모바일 메뉴 닫기
    // 같은 아이콘을 다시 누르면 닫고, 다른 아이콘을 누르면 그 메뉴를 엽니다.
    setActiveMenu((prev) => (prev === menuName ? null : menuName));
  };

  // 마우스가 헤더 밖으로 나갈 때 작동하는 함수 (텍스트 카테고리만 자동 차단)
  const handleHeaderLeave = () => {
    if (activeMenu !== "SEARCH" && activeMenu !== "USER") {
      setActiveMenu(null);
    }
  };

  // 아이콘용 외부 클릭 감지 리스너
  useEffect(() => {
    // 검색/사용자 메뉴가 열린 경우에만 헤더 바깥 클릭을 감지
    const handleOutsideClick = (event) => {
      if (
        (activeMenu === "SEARCH" || activeMenu === "USER") &&
        headerRef.current &&
        !headerRef.current.contains(event.target)
      ) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    // 컴포넌트가 사라지거나 activeMenu가 바뀔 때 이벤트를 정리
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [activeMenu]);

  // 모바일 메뉴가 열려 있는 동안 뒤 화면 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // 화면이 넓어지면(데스크톱 전환) 모바일 메뉴 자동으로 닫기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767) {
        setMobileOpen(false);
        setMobileSub(null);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // renderDropdownContent 함수 내부 컴포넌트들에 onClose={closeMenu}를 모두 주입합니다.
  const renderDropdownContent = () => {
    // activeMenu 값에 맞는 드롭다운 컴포넌트를 골라 반환
    switch (activeMenu) {
      case "MEN":
        return (
          <CommonDropdown
            items={["ALL", "NEW", "JACKETS", "KNITWEAR", "TOPS", "BOTTOMS"]}
            onClose={closeMenu}
          />
        );
      case "WOMEN":
        return (
          <CommonDropdown
            items={["ALL", "NEW", "JACKETS", "SHIRTING", "DRESSES"]}
            onClose={closeMenu}
          />
        );
      case "ACCESSORIES":
        return (
          <CommonDropdown
            items={["ALL", "HATS", "BAGS", "BELTS", "SOCKS"]}
            onClose={closeMenu}
          />
        );
      case "LOOKBOOK":
        return <LookbookDropdown onClose={closeMenu} />;
      case "SEARCH":
        return <SearchDropdownContent onClose={closeMenu} />;
      case "USER":
        return <UserDropdownContent onClose={closeMenu} />;
      default:
        return null;
    }
  };

  return (
    <header
      className={`header-wrap${mobileOpen ? " mobile-open" : ""}`}
      ref={headerRef}
      onMouseLeave={handleHeaderLeave}
    >
      {/* 로고 클릭 시 홈으로 이동하며 열려 있던 메뉴도 닫습니다. */}
      <div className="logo-header">
        <Link to="/" onClick={closeMenu}>
          {" "}
          {/* 로고 클릭 시에도 혹시 열려있다면 닫히도록 추가 */}
          <img src={logo} alt="carhartt-logo" />
        </Link>
      </div>

      <nav className="gnb" aria-label="주 메뉴">
        <div className="gnb-container-box">
          <ul className="gnb-wrap">
            <li onMouseEnter={() => setActiveMenu("MEN")}>
              <Link to="/Goods" className="gnb-text">
                MEN
              </Link>
            </li>
            <li onMouseEnter={() => setActiveMenu("WOMEN")}>
              <Link to="/women" className="gnb-text">
                WOMEN
              </Link>
            </li>
            <li onMouseEnter={() => setActiveMenu("ACCESSORIES")}>
              <Link to="/accessories" className="gnb-text">
                ACCESSORIES
              </Link>
            </li>
            <li onMouseEnter={() => setActiveMenu("LOOKBOOK")}>
              <Link to="/lookBook" className="gnb-text">
                LOOK BOOK
              </Link>
            </li>
            {/* SHOP, NOTICE는 드롭다운 없음: 올리면 열려 있던 패널을 닫기 */}
            <li onMouseEnter={() => setActiveMenu(null)}>
              <Link to="/shop" className="gnb-text">
                SHOP
              </Link>
            </li>
            <li onMouseEnter={() => setActiveMenu(null)}>
              <Link to="/board-list" className="gnb-text">
                NOTICE
              </Link>
            </li>
          </ul>

          {/* 공통 드롭다운 패널 */}
          {/* 메뉴가 열렸을 때만 드롭다운 영역을 화면에 만듭니다. */}
        </div>
      </nav>

      {activeMenu && activeMenu !== "SEARCH" && activeMenu !== "USER" && (
        <div
          className={`capsule-dropdown-panel panel-${activeMenu.toLowerCase()}`}
        >
          <div className="dropdown-custom-content">
            {renderDropdownContent()}
          </div>
        </div>
      )}

      <div className="header-icon">
        {/* 검색과 사용자 버튼은 같은 토글 함수를 사용합니다. */}
        <div className="icon-dropdown-anchor">
          <button
            type="button"
            className="search-btn-header"
            onClick={() => handleIconClick("SEARCH")}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          {activeMenu === "SEARCH" && (
            <div className="capsule-dropdown-panel panel-search">
              <div className="dropdown-custom-content">
                <SearchDropdownContent onClose={closeMenu} />
              </div>
            </div>
          )}
        </div>
        <div className="icon-dropdown-anchor">
          <button
            type="button"
            className="guest-btn-header"
            onClick={() => handleIconClick("USER")}
          >
            <FontAwesomeIcon icon={faUser} />
          </button>
          {activeMenu === "USER" && (
            <div className="capsule-dropdown-panel panel-user">
              <div className="dropdown-custom-content">
                <UserDropdownContent onClose={closeMenu} />
              </div>
            </div>
          )}
        </div>
        {/* 장바구니는 메뉴를 닫은 다음 해당 페이지로 바로 이동합니다. */}
        <button
          type="button"
          className="cart-btn-header"
          onClick={() => {
            closeMenu(); // 장바구니로 갈 때도 드롭다운이 열려있다면 초기화
            navigate("/cart");
          }}
        >
          <FontAwesomeIcon icon={faCartShopping} />
        </button>
        {/* 모바일 메뉴 버튼 */}
        <button
          type="button"
          className="mobile-menuBar"
          aria-expanded={mobileOpen}
          aria-label="메뉴 열기"
          onClick={() => {
            setActiveMenu(null); // 열려 있던 검색/유저 패널 닫기
            setMobileOpen((prev) => !prev);
            setMobileSub(null);
          }}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      {/* 모바일 전용 메뉴 패널 (항상 렌더링, open 클래스로 열고 닫음) */}
      <nav
        className={`mobile-menu-panel${mobileOpen ? " open" : ""}`}
        aria-label="모바일 메뉴"
        aria-hidden={!mobileOpen}
      >
        <ul className="mobile-menu-list">
          {MOBILE_MENU.map((menu) => {
            const isOpen = mobileSub === menu.label;
            return (
              <li key={menu.label}>
                <button
                  type="button"
                  className={`mobile-menu-item${isOpen ? " open" : ""}`}
                  aria-expanded={isOpen}
                  onClick={() =>
                    setMobileSub((prev) =>
                      prev === menu.label ? null : menu.label,
                    )
                  }
                >
                  {menu.label}
                  <span className="mobile-menu-arrow">
                    <FontAwesomeIcon icon={faChevronDown} />
                  </span>
                </button>

                {/* 서브메뉴: 항상 렌더링하고 높이만 애니메이션 */}
                <div className={`mobile-sub-wrap${isOpen ? " open" : ""}`}>
                  <ul className="mobile-sub-list">
                    {menu.sub.map((s) => (
                      <li key={s.label}>
                        <Link to={s.to} onClick={closeMenu}>
                          {s.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="mobile-close-btn"
          onClick={closeMenu}
          aria-label="메뉴 닫기"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </nav>
    </header>
  );
};

export default Header;
