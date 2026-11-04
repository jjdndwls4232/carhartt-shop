import { Link } from "react-router-dom";
import "./Header.css";
//src/img
import logo from "../img/logo_carhartt.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCartShopping,
  faMagnifyingGlass,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  return (
    <header className="header-wrap">
      <div className="logo-header">
        <Link to="/">
          <img src={logo} alt="carhartt-logo" />
        </Link>
      </div>

      <nav className="gnb" alt="주 메뉴">
        <ul className="gnb-wrap">
          <li>
            <Link to="/Goods" className="gnb-text">
              MEN
            </Link>
          </li>
          <li>
            <Link to="/women" className="gnb-text">
              WOMEN
            </Link>
          </li>
          <li>
            <Link to="/accessories" className="gnb-text">
              ACCESSORIES
            </Link>
          </li>
          <li>
            <Link to="/lookBook" className="gnb-text">
              LOOK BOOK
            </Link>
          </li>
          <li>
            <Link to="/shop" className="gnb-text">
              SHOP
            </Link>
          </li>
          <li>
            <Link to="/notice" className="gnb-text">
              NOTICE
            </Link>
          </li>
        </ul>
      </nav>
      <div className="header-icon">
        <button type="button" className="search-btn-header">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
        <button type="button" className="guest-btn-header">
          <FontAwesomeIcon icon={faUser} />
        </button>
        <button type="button" className="cart-btn-header">
          <FontAwesomeIcon icon={faCartShopping} />
        </button>
      </div>
    </header>
  );
};

export default Header;
