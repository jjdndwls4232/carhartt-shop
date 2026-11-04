import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

const imgPath = import.meta.env.BASE_URL + "img/";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./BestProductSlider.scss";

const BestProductSlider = () => {
  // 베스트 상품 데이터
  const bestProducts = [
    {
      id: 1,
      name: "OG ACTIVE JACKET",
      price: 423000,
      image: imgPath + "HomeBestGoods1.jpg",
    },
    {
      id: 2,
      name: "OG SINGLE KNEE PANT CAMANO",
      price: 139800,
      image: imgPath + "HomeBestGoods2.jpg",
    },
    {
      id: 3,
      name: "ALUMNI BEANIE",
      price: 83000,
      image: imgPath + "HomeBestGoods3.jpg",
    },
    {
      id: 4,
      name: "W L/S CARDONA POCKET T-SHIRT",
      price: 133000,
      image: imgPath + "HomeBestGoods4.jpg",
    },
    {
      id: 5,
      name: "W OG ARCAN JACKET",
      price: 425000,
      image: imgPath + "HomeBestGoods5.jpg",
    },
    {
      id: 6,
      name: "CLIFF BACKPACK",
      price: 158000,
      image: imgPath + "HomeBestGoods6.jpg",
    },
    {
      id: 7,
      name: "CANVAS 6-PANEL CAP",
      price: 73000,
      image: imgPath + "HomeBestGoods7.jpg",
    },
    {
      id: 8,
      name: "OG SANTA FE JACKET",
      price: 483000,
      image: imgPath + "HomeBestGoods8.jpg",
    },
    {
      id: 9,
      name: "W HOODED NELSON JACKET",
      price: 235000,
      image: imgPath + "HomeBestGoods9.jpg",
    },
    {
      id: 10,
      name: "SUBU CORDURA® SLIPPERS",
      price: 138000,
      image: imgPath + "HomeBestGoods10.jpg",
    },
    {
      id: 11,
      name: "W SINGLE KNEE SKIRT",
      price: 245000,
      image: imgPath + "HomeBestGoods11.jpg",
    },
    {
      id: 12,
      name: "L/S VISTA T-SHIRT",
      price: 178000,
      image: imgPath + "HomeBestGoods12.jpg",
    },
    {
      id: 13,
      name: "BOWDEN SHOULDER BAG",
      price: 128000,
      image: imgPath + "HomeBestGoods13.jpg",
    },
    {
      id: 14,
      name: "HOODED MADISON JACKET",
      price: 188000,
      image: imgPath + "HomeBestGoods14.jpg",
    },
    {
      id: 15,
      name: "L/S ETHAN SHIRT",
      price: 225000,
      image: imgPath + "HomeBestGoods15.jpg",
    },
  ];

  return (
    <div className="best-slider-container">
      <h2 className="slider-title">BEST</h2>

      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        slidesPerView={4}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        breakpoints={{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="best-swiper"
      >
        {bestProducts.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="product-card">
              <div className="image-box">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="info-box">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">
                  ₩{product.price.toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BestProductSlider;
