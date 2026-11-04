import { Link } from "react-router-dom";
import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faYoutube,
  faFacebook,
  faPinterest,
  faSoundcloud,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="footer-wrap">
      <section className="subs-wrap">
        <div className="subs-text">
          Carhartt Newsletter <br />
          <span>
            신제품 입고 캠페인, 이벤트 등 <br />
            칼하트의 다향한 소식을 메일로 받아보세요!
          </span>
        </div>
        <div className="input-mail">
          <fieldset>
            <input type="text" placeholder=" 이메일을 입력해주세요." />
            <button type="submit">구독하기</button>
          </fieldset>
        </div>
      </section>
      <section className="info-wrap">
        <div className="info-text">
          <div className="info-company">
            <ul>
              <li>
                <Link className="info-text-first">고객지원</Link>
              </li>
              <li>
                <Link>문의하기</Link>
              </li>
              <li>
                <Link>배송 안내</Link>
              </li>
              <li>
                <Link>반품 안내</Link>
              </li>
              <li>
                <Link>나의 계정</Link>
              </li>
              <li>
                <Link>자주하는 질문</Link>
              </li>
            </ul>
            <ul>
              <li>
                <Link className="info-text-first">기업정보</Link>
              </li>
              <li>
                <Link>멤버쉽</Link>
              </li>
              <li>
                <Link>칼하트윕에 대하여</Link>
              </li>
              <li>
                <Link>칼하트윕 라디오</Link>
              </li>
              <li>
                <Link>기업의 사회적 책임</Link>
              </li>
              <li>
                <Link>채용안내</Link>
              </li>
            </ul>
          </div>
          <div className="info-worksout">
            <span>
              <div className="info-text-first">주식회사 웍스아웃</div>
              사업자등록번호 : 106-86-85373 <br />
              대표 : 강승혁,박선영 <br />
              전자우편주소 : customer@carhartt-wip.co.kr <br /> 대표전화 : 02-541-0852 <br />
              주소 : 서울시 마포구 월드컵북로23길 <br />
              통신판매업신고 : 2014-서울마포-0219 <br />
              호스팅 사업자 : 아마존웹서비스
            </span>
          </div>
        </div>
        <div className="info-sns">
          <div className="info-sns-text">
            <p>© 칼하트윕 코리아 2026</p>
            <Link>이용약관</Link>
            <Link>개인정보취급 방침</Link>
            <Link>구매안전 서비스 가입사실 확인</Link>
          </div>
          <div className="info-sns-icon">
            <Link>
              <FontAwesomeIcon icon={faInstagram} />
            </Link>
            <Link>
              <FontAwesomeIcon icon={faFacebook} />
            </Link>
            <Link>
              <FontAwesomeIcon icon={faYoutube} />
            </Link>
            <Link>
              <FontAwesomeIcon icon={faPinterest} />
            </Link>
            <Link>
              <FontAwesomeIcon icon={faSoundcloud} />
            </Link>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
