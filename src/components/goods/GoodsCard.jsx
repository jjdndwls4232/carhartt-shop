// ============================================================
// GoodsCard.jsx  (components/goods 폴더)
// 역할: 상품 카드 1개 (이미지 + 색상 동그라미 + 이름/설명/가격)
//   색상 동그라미를 누르면 그 색상의 사진(goods.json 의 colors[].image)으로 바뀜
// ============================================================
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { formatPrice } from "./goodsData";

// 한 번에 보여줄 색상 동그라미 개수 (넘으면 좌우 화살표가 생김)
const VISIBLE_SWATCHES = 3;

const GoodsCard = ({ product }) => {
  const colors = product.colors;
  // 선택한 색상 id (처음에는 첫 번째 색상)
  const [colorId, setColorId] = useState(colors[0].id);
  // 색상 동그라미 목록에서 맨 왼쪽에 보이는 순번 (화살표로 이동)
  const [swatchStart, setSwatchStart] = useState(0);
  // 불러오지 못한 사진 주소 목록 (아직 사진 파일을 안 넣은 색상)
  const [brokenImages, setBrokenImages] = useState([]);

  const selected = colors.find((c) => c.id === colorId) ?? colors[0];
  const isBroken = brokenImages.includes(selected.image);

  const hasArrows = colors.length > VISIBLE_SWATCHES;
  const maxStart = Math.max(0, colors.length - VISIBLE_SWATCHES);
  const visibleColors = colors.slice(swatchStart, swatchStart + VISIBLE_SWATCHES);

  return (
    <article className={`goods-card${product.soldOut ? " is-soldout" : ""}`}>
      <div className="goods-card-image">
        {/* key 가 바뀌면 새 요소로 그려져서 색을 바꿀 때마다 페이드인 애니메이션이 다시 실행됨 */}
        <div className="goods-card-photo" key={selected.id}>
          {isBroken ? (
            // 사진 파일이 없을 때 : 색상 이름과 함께 "준비중" 표시
            <div className="goods-card-empty" style={{ "--swatch": selected.hex }}>
              <span className="goods-card-empty-dot" />
              <p>{selected.name}</p>
              <p>이미지 준비중</p>
            </div>
          ) : (
            <img
              src={selected.image}
              alt={`${product.title} ${selected.name}`}
              loading="lazy"
              onError={() => setBrokenImages((prev) => [...prev, selected.image])}
            />
          )}
        </div>
        {product.soldOut && <span className="goods-card-badge">SOLD OUT</span>}
        {product.isSale && !product.soldOut && (
          <span className="goods-card-badge is-sale">SALE</span>
        )}
      </div>

      {/* 색상 동그라미 */}
      <div className="goods-swatches">
        {hasArrows && (
          <button
            type="button"
            className="goods-swatch-arrow"
            aria-label="이전 색상"
            disabled={swatchStart === 0}
            onClick={() => setSwatchStart((s) => Math.max(0, s - 1))}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}

        <ul>
          {visibleColors.map((color) => (
            <li key={color.id}>
              <button
                type="button"
                className={`goods-swatch${color.id === selected.id ? " is-active" : ""}`}
                style={{ "--swatch": color.hex }}
                aria-label={`${color.name} 색상`}
                aria-pressed={color.id === selected.id}
                title={color.name}
                onClick={() => setColorId(color.id)}
              />
            </li>
          ))}
        </ul>

        {hasArrows && (
          <button
            type="button"
            className="goods-swatch-arrow"
            aria-label="다음 색상"
            disabled={swatchStart >= maxStart}
            onClick={() => setSwatchStart((s) => Math.min(maxStart, s + 1))}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}
      </div>

      <div className="goods-card-info">
        <h3 className="goods-card-title">{product.title}</h3>
        <p className="goods-card-desc">{product.description}</p>
        <p className="goods-card-price">
          {product.isSale && (
            <>
              <span className="goods-card-rate">{product.discountRate}%</span>
              <del>{formatPrice(product.price)}</del>
            </>
          )}
          <strong>{formatPrice(product.finalPrice)}</strong>
        </p>
      </div>
    </article>
  );
};

export default GoodsCard;
