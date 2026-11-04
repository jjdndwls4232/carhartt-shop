// ============================================================
// Goods.jsx  (routes 폴더, 경로: /goods)
// 역할: 상품 목록 페이지
//   상단 배너(경로/제목/설명) → 카테고리 탭 → 필터/정렬 → 상품 카드 목록
//   상품은 public/data/goods.json 에서 받아오고, 선택한 탭은 주소(?category=men)에 저장
// ============================================================
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import GoodsCard from "../components/goods/GoodsCard";
import {
  CATEGORY_TABS,
  PRODUCTS_URL,
  SIZE_OPTIONS,
  SORT_OPTIONS,
  toGoods,
} from "../components/goods/goodsData";
import "./Goods.scss";

const imgPath = import.meta.env.BASE_URL + "img/";

const Goods = () => {
  // ---------- 상품 불러오기 ----------
  const [products, setProducts] = useState([]); // 화면용으로 바꾼 상품 목록
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [reloadKey, setReloadKey] = useState(0); // 다시 시도 버튼을 누를 때마다 1씩 늘려서 다시 요청

  useEffect(() => {
    // 페이지를 떠나거나 다시 요청하면 이전 요청을 취소
    const controller = new AbortController();
    fetch(PRODUCTS_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProducts(data.map(toGoods));
        setStatus("success");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, [reloadKey]);

  const retry = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

  // ---------- 탭 (주소에 저장 → 새로고침/뒤로가기에도 유지) ----------
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = CATEGORY_TABS.find((t) => t.key === searchParams.get("category")) ?? CATEGORY_TABS[0];
  const tabIndex = CATEGORY_TABS.indexOf(tab);

  const selectTab = (key) => setSearchParams(key === "all" ? {} : { category: key });
  // → 버튼 : 다음 탭으로 (마지막이면 처음으로)
  const nextTab = () => selectTab(CATEGORY_TABS[(tabIndex + 1) % CATEGORY_TABS.length].key);

  // ---------- 필터 / 정렬 ----------
  const [size, setSize] = useState("all");
  const [saleOnly, setSaleOnly] = useState(false);
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [sort, setSort] = useState("latest");

  const compare = SORT_OPTIONS.find((o) => o.value === sort).compare;
  const visibleProducts = products
    .filter((p) => tab.key === "all" || p.category === tab.key)
    .filter((p) => size === "all" || p.sizes.includes(size))
    .filter((p) => !saleOnly || p.isSale)
    .filter((p) => !hideSoldOut || !p.soldOut)
    .sort(compare); // filter 가 새 배열을 만들어서 원본 products 는 바뀌지 않음

  return (
    <div className="goods-page">
      {/* ==================== 상단 배너 ==================== */}
      <section
        className="goods-hero"
        style={{ "--hero-img": `url("${imgPath}topBanner2.jpg")` }}
      >
        <div className="goods-hero-inner">
          <p className="goods-breadcrumb">
            CARHARTT WIP <span aria-hidden="true">&gt;</span> SHOP{" "}
            <span aria-hidden="true">&gt;</span> {tab.label}
          </p>
          <h1 className="goods-hero-title">{tab.title}</h1>
          <p className="goods-hero-desc">{tab.desc}</p>
        </div>
      </section>

      <div className="goods-inner">
        {/* ==================== 카테고리 탭 ==================== */}
        <div className="goods-tabs">
          <ul role="tablist" aria-label="상품 카테고리">
            {CATEGORY_TABS.map((t) => (
              <li key={t.key}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={t.key === tab.key}
                  className={`goods-tab${t.key === tab.key ? " is-active" : ""}`}
                  onClick={() => selectTab(t.key)}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="goods-tab-next" aria-label="다음 카테고리" onClick={nextTab}>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        {/* ==================== 필터 / 정렬 ==================== */}
        <div className="goods-toolbar">
          <div className="goods-filters">
            <label className="goods-select">
              <span className="visually-hidden">사이즈</span>
              <select value={size} onChange={(e) => setSize(e.target.value)}>
                {SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "전체 사이즈" : s}
                  </option>
                ))}
              </select>
              <FontAwesomeIcon icon={faChevronDown} className="goods-select-arrow" />
            </label>

            <label className="goods-check">
              <input type="checkbox" checked={saleOnly} onChange={(e) => setSaleOnly(e.target.checked)} />
              <span className="goods-check-box" />
              세일상품 보기
            </label>
            <label className="goods-check">
              <input type="checkbox" checked={hideSoldOut} onChange={(e) => setHideSoldOut(e.target.checked)} />
              <span className="goods-check-box" />
              품절 제외
            </label>
          </div>

          <label className="goods-select is-sort">
            <span className="visually-hidden">정렬</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <FontAwesomeIcon icon={faChevronDown} className="goods-select-arrow" />
          </label>
        </div>

        {/* ==================== 상품 목록 ==================== */}
        {status === "loading" && (
          <ul className="goods-grid" aria-busy="true" aria-label="상품을 불러오는 중">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className="goods-skeleton">
                <div className="goods-skeleton-image" />
                <div className="goods-skeleton-line" />
                <div className="goods-skeleton-line is-short" />
              </li>
            ))}
          </ul>
        )}

        {status === "error" && (
          <div className="goods-message">
            <p>상품을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
            <button type="button" className="goods-retry" onClick={retry}>
              다시 시도
            </button>
          </div>
        )}

        {status === "success" &&
          (visibleProducts.length ? (
            <ul className="goods-grid">
              {visibleProducts.map((product) => (
                <li key={product.id}>
                  <GoodsCard product={product} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="goods-message">
              <p>조건에 맞는 상품이 없습니다.</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Goods;
