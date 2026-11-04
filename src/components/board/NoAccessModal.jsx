// ============================================================
// NoAccessModal.jsx  (components/board 폴더 - 새로 만드는 파일)
// 역할: "열람 권한이 없습니다" 안내 모달 (화면 정가운데에 뜨는 팝업창)
//   - 목록 페이지 : 다른 사람의 글을 눌렀을 때
//   - 상세 페이지 : 주소를 직접 입력해서 다른 사람의 글로 들어왔을 때
//   두 곳에서 똑같이 쓰기 때문에 컴포넌트로 따로 만들어 둠
// props
//   - show    : true 이면 모달이 보이고, false 이면 숨김
//   - onClose : 닫을 때 실행할 함수 (확인 버튼 / 바깥 영역 클릭 / ESC 키)
// ============================================================
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import "./NoAccessModal.scss";

const NoAccessModal = ({ show, onClose }) => {
  return (
    // react-bootstrap 의 Modal 을 사용 (이미 설치되어 있고 bootstrap css 도 불러오는 중)
    //   centered      : 화면 세로 가운데에 배치
    //   onHide        : 바깥 영역 클릭 / ESC 키로 닫으려 할 때 실행되는 함수
    //   dialogClassName : 모달 크기와 모양을 바꾸기 위해 붙이는 클래스 (NoAccessModal.scss)
    //   Modal 은 ESC 키 닫기, 포커스 가두기 같은 접근성 기능을 알아서 처리해 줌
    <Modal
      show={show}
      onHide={onClose}
      centered
      dialogClassName="board-modal"
      aria-labelledby="noAccessTitle"
    >
      <Modal.Body className="board-modal-body">
        <span className="board-modal-icon" aria-hidden="true">
          <FontAwesomeIcon icon={faLock} />
        </span>
        <h2 id="noAccessTitle" className="board-modal-title">
          열람 권한이 없습니다
        </h2>
        <p className="board-modal-text">
          공지사항과 본인이 작성한 글만
          <br />
          확인할 수 있습니다.
        </p>
        <button type="button" className="board-modal-btn" onClick={onClose}>
          확인
        </button>
      </Modal.Body>
    </Modal>
  );
};

export default NoAccessModal;
