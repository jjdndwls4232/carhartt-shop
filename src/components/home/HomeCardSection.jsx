import { useNavigate } from "react-router-dom"; // Goods 페이지 이동을 위한 훅
import "./HomeCardSection.scss";
const imgPath = import.meta.env.BASE_URL + "img/";

const CARD_DATA = [
  {
    id: 1,
    title: "FW26 JACKETS",
    description:
      "계절의 변화에도 변함없는 클래식함, FW26을 완성하는 워크웨어 자켓",
    image: imgPath + "home_cont1.jpg",
    btnText: "바로가기",
  },
  {
    id: 2,
    title: "New Men's Arrivals",
    description:
      "워크웨어의 거친 매력과 현대적인 감각이 만난 새로운 시즌 컬렉션",
    image: imgPath + "home_cont2.jpg",
    btnText: "바로가기",
  },
  {
    id: 3,
    title: "New Women's Arrivals",
    description: "칼하트의 헤리티지와 감각적인 스타일이 만난 여성 신상품",
    image: imgPath + "home_cont3.jpg",
    btnText: "바로가기",
  },
];

const HomeCardSection = () => {
  const navigate = useNavigate();

  // 클릭 시 Goods 페이지로 이동하는 함수
  const handleNavigate = () => {
    navigate("/goods");
  };

  return (
    <section className="card-section-container">
      <div className="card-grid">
        {CARD_DATA.map((card) => (
          <div key={card.id} className="card-item">
            {/* 이미지 영역 */}
            <div className="card-image-box" onClick={handleNavigate}>
              <img src={card.image} alt={card.title} className="card-img" />
            </div>

            {/* 텍스트 영역 */}
            <div className="card-content-box">
              <h3 className="card-title" onClick={handleNavigate}>
                {card.title}
              </h3>
              <p className="card-desc">{card.description}</p>

              {/* 바로가기 버튼 (하나만 배치 및 호버 확대 효과) */}
              <div className="card-link-wrap">
                <button className="card-link-btn" onClick={handleNavigate}>
                  {card.btnText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeCardSection;
