import "./Home.css";
import TopBanner from "../components/home/TopBanner.jsx";
import HomeCardSection from "../components/home/HomeCardSection.jsx";
import BestProductSlider from "../components/home/BestProductSlider.jsx";
import WorldWide from "../components/home/WorldWide.jsx";

const Home = () => {
  return (
    <>
      <section className="top-banner-wrap">
        <TopBanner />
      </section>
      <section className="content-wrap">
        <HomeCardSection />
      </section>
      <section className="bestGoods-wrap">
        <BestProductSlider />
      </section>
      <section className="worldwide-wrap">
        <WorldWide />
      </section>
    </>
  );
};

export default Home;
