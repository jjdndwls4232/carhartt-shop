import { useState, useEffect, useRef } from "react";
import "./TopBanner.scss"; // 파일명 통일에 맞춘 임포트
const imgPath = import.meta.env.BASE_URL + "img/";

const BANNER_DATA = [
  {
    id: 1,
    title: "Fall 26 Styling Guide",
    image: imgPath + "topBanner1.jpg",
    btnText: "VIEW GUIDE",
  },
  {
    id: 2,
    title: "Closely Knit",
    image: imgPath + "topBanner2.jpg",
    btnText: "VIEW SHOP",
  },
  {
    id: 3,
    title: "F/W 2026 by alex acy",
    image: imgPath + "topBanner3.jpg",
    btnText: "VIEW MORE",
  },
  {
    id: 4,
    title: "[news] Yon Ho Kyung",
    image: imgPath + "topBanner4.jpg",
    btnText: "VIEW NEWS",
  },
];

const TopBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef(null);
  const DELAY_TIME = 4000; // 4초

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setActiveIndex((prevIndex) =>
        prevIndex === BANNER_DATA.length - 1 ? 0 : prevIndex + 1,
      );
    }, DELAY_TIME);

    return () => resetTimeout();
  }, [activeIndex]);

  return (
    <div className="banner-container">
      {/* 1. 배경 이미지 영역 */}
      <div className="image-area">
        {BANNER_DATA.map((item, index) => (
          <div
            key={item.id}
            className={`slide-image-wrapper ${index === activeIndex ? "active" : ""}`}
          >
            <img src={item.image} alt={item.title} className="slide-image" />
            <div className="overlay" />
          </div>
        ))}
      </div>

      {/* 2. 전면 콘텐츠 레이아웃 */}
      <div className="content-layout">
        {/* 왼쪽 세로 텍스트 메뉴 */}
        <div className="text-menu">
          {BANNER_DATA.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(index)}
              className={`menu-button ${index === activeIndex ? "active-menu" : ""}`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* 오른쪽 바로가기 버튼 */}
        <div className="cta-area">
          <button className="cta-button">
            {BANNER_DATA[activeIndex].btnText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
