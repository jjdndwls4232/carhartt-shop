// ============================================================
// WorldWide.jsx  (components/home 폴더)
// 역할: 이미지 카드들이 휘어진 원통(링) 표면에 붙어서 계속 돌아가는 섹션
//   - 가만히 두면 오른쪽 → 왼쪽으로 천천히 자동 회전
//   - 마우스를 올리면 손 모양(grab), 누르고 있으면 주먹 모양(grabbing)
//   - 누른 채로 좌우로 끌면 링을 직접 돌릴 수 있고, 놓으면 그 속도로
//     조금 미끄러지다가 다시 자동 회전 속도로 돌아감
// 원리
//   - 카드 한 장을 세로로 얇게 SLICES 조각으로 잘라서, 조각마다 조금씩 다른 각도로
//     원통 둘레에 세움 → 평평한 판이 아니라 "휘어진" 이미지처럼 보임
//   - 원근감(perspective)을 강하게 주고 링 전체를 살짝 기울여서(tilt)
//     가운데는 크고 양옆은 작아지는 볼록한 렌즈 모양을 만듦
//   - JS 는 "링 전체를 몇 도 돌릴지(--rotate)" 숫자 하나만 매 프레임 바꿔 줌
// ============================================================
import { useEffect, useRef, useState } from "react";
import "./WorldWide.scss";

const imgPath = import.meta.env.BASE_URL + "img/";

// ------------------------------------------------------------
// 📷 이미지 넣는 곳 (총 8개)
//   1) 이미지 파일을 public/img/ 폴더에 넣고
//   2) 아래 image: "" 를 image: imgPath + "파일이름.jpg" 로 바꾸면 됨
//      예) image: imgPath + "HomeWorldWide1.jpg"
//   image 가 비어 있으면 회색 빈 칸(번호 표시)으로 보여줌
// ------------------------------------------------------------
const WORLDWIDE_IMAGES = [
  { id: 1, image: "", alt: "월드와이드 이미지 1" },
  { id: 2, image: "", alt: "월드와이드 이미지 2" },
  { id: 3, image: "", alt: "월드와이드 이미지 3" },
  { id: 4, image: "", alt: "월드와이드 이미지 4" },
  { id: 5, image: "", alt: "월드와이드 이미지 5" },
  { id: 6, image: "", alt: "월드와이드 이미지 6" },
  { id: 7, image: "", alt: "월드와이드 이미지 7" },
  { id: 8, image: "", alt: "월드와이드 이미지 8" },
];

// 이미지가 없을 때 쓰는 회색 빈 칸 (SVG 그림을 주소 문자열로 만든 것)
const placeholder = (n) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='100%' height='100%' fill='#e9e9ec'/><text x='50%' y='50%' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif' font-size='36' font-weight='600' letter-spacing='4' fill='#999'>IMAGE ${n}</text></svg>`,
  );

// ---------- 설정값 ----------
// 링 한 바퀴에 놓을 카드 칸 수. 8장만 두르면 칸 사이가 너무 벌어져서
// 8장을 두 번 반복해 16칸으로 채움
const SLOT_COUNT = 16;
const SLOT_ANGLE = 360 / SLOT_COUNT; // 칸 하나의 각도 (22.5도)
const CARD_FILL = 0.9; // 칸 중 카드가 차지하는 비율 (나머지 10%는 카드 사이 간격)
const CARD_ANGLE = SLOT_ANGLE * CARD_FILL; // 카드 한 장의 각도 (20.25도)
const SLICES = 10; // 카드 한 장을 몇 조각으로 자를지 (많을수록 곡면이 매끄럽지만 무거워짐)
const SLICE_ANGLE = CARD_ANGLE / SLICES; // 조각 하나의 각도
// 반지름 = 카드 너비 ÷ 카드 각도(라디안) → 카드 너비가 원 둘레의 호 길이와 같아짐
const RADIUS_RATIO = 1 / ((CARD_ANGLE * Math.PI) / 180);

const AUTO_SPEED = -0.006; // 자동 회전 속도 (1ms 당 회전 각도, 음수 = 오른쪽 → 왼쪽)
const RETURN_EASE = 0.035; // 손을 놓은 뒤 자동 속도로 돌아가는 빠르기 (클수록 빨리 돌아감)
const MAX_FLING = 0.25; // 세게 던졌을 때의 최대 속도 (deg/ms) - 너무 빙글빙글 돌지 않게 제한

// 16칸에 이미지를 1~8, 1~8 순서로 채운 배열
const SLOTS = Array.from(
  { length: SLOT_COUNT },
  (_, i) => WORLDWIDE_IMAGES[i % WORLDWIDE_IMAGES.length],
);

const WorldWide = () => {
  // 회전하는 링 DOM (여기에 --rotate 값을 직접 넣음)
  const ringRef = useRef(null);
  // 화면 그리기와 상관없이 매 프레임 바뀌는 값들은 state 대신 ref 에 보관
  //   (state 를 쓰면 1초에 60번 다시 렌더링되어 느려짐)
  const motionRef = useRef({
    rotation: 0, // 지금 링이 돌아간 각도 (deg)
    velocity: AUTO_SPEED, // 지금 회전 속도 (deg/ms)
    dragging: false, // 누르고 끄는 중인지
    startX: 0, // 누르기 시작한 마우스 x 좌표
    startRotation: 0, // 누르기 시작했을 때의 각도
    lastX: 0, // 직전 move 이벤트의 x 좌표 (속도 계산용)
    lastTime: 0, // 직전 move 이벤트의 시간
  });
  // 커서 모양(주먹)을 바꾸는 class 용 state (누를 때/뗄 때만 바뀌어서 렌더링 부담 없음)
  const [isDragging, setIsDragging] = useState(false);

  // ---------- 애니메이션 루프 ----------
  useEffect(() => {
    // "동작 줄이기" 설정을 켠 사용자는 자동 회전을 끔 (드래그는 가능)
    const autoSpeed = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : AUTO_SPEED;
    const motion = motionRef.current;
    motion.velocity = autoSpeed;

    let rafId;
    let prevTime = performance.now();

    // requestAnimationFrame : 브라우저가 화면을 다시 그리기 직전마다(보통 1초에 60번) 실행
    const tick = (now) => {
      // 탭을 갔다 오면 시간 차이가 커져 한 번에 확 도는 것을 막기 위해 최대 50ms 로 제한
      const dt = Math.min(now - prevTime, 50);
      prevTime = now;

      if (!motion.dragging) {
        // 현재 속도를 자동 속도 쪽으로 조금씩 끌어당김 → 관성 후 자연스럽게 자동 회전으로 복귀
        motion.velocity +=
          (autoSpeed - motion.velocity) * RETURN_EASE * (dt / 16);
        motion.rotation += motion.velocity * dt;
      }

      ringRef.current?.style.setProperty("--rotate", `${motion.rotation}deg`);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    // 컴포넌트가 사라지면(다른 페이지로 이동) 루프를 멈춤
    return () => cancelAnimationFrame(rafId);
  }, []);

  // 마우스로 1px 움직였을 때 링이 몇 도 돌아야 하는지
  //   앞쪽 카드가 손가락을 그대로 따라오도록 "원 둘레 1px = 180 / (π × 반지름) 도"로 계산
  const getDegPerPx = () => {
    const sliceWidth = ringRef.current?.firstElementChild?.offsetWidth || 40;
    const cardWidth = sliceWidth * SLICES;
    return 180 / (Math.PI * cardWidth * RADIUS_RATIO);
  };

  // ---------- 드래그 (마우스 + 터치를 pointer 이벤트 하나로 처리) ----------
  const handlePointerDown = (e) => {
    const motion = motionRef.current;
    motion.dragging = true;
    motion.startX = e.clientX;
    motion.startRotation = motion.rotation;
    motion.lastX = e.clientX;
    motion.lastTime = performance.now();
    motion.velocity = 0;
    // 마우스가 섹션 밖으로 나가도 move/up 이벤트를 계속 이 요소가 받도록 붙잡아 둠
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    const motion = motionRef.current;
    if (!motion.dragging) return;

    const degPerPx = getDegPerPx();
    // 누른 지점에서 움직인 거리만큼 회전 (오른쪽으로 끌면 링도 오른쪽으로)
    motion.rotation =
      motion.startRotation + (e.clientX - motion.startX) * degPerPx;

    // 손을 놓았을 때 이어서 미끄러질 속도 = 최근 움직인 거리 / 걸린 시간
    const now = performance.now();
    const dt = now - motion.lastTime;
    if (dt > 0) {
      const speed = ((e.clientX - motion.lastX) * degPerPx) / dt;
      // -MAX_FLING ~ MAX_FLING 범위 안으로 자름
      motion.velocity = Math.max(-MAX_FLING, Math.min(MAX_FLING, speed));
    }
    motion.lastX = e.clientX;
    motion.lastTime = now;
  };

  const handlePointerUp = (e) => {
    const motion = motionRef.current;
    if (!motion.dragging) return;
    motion.dragging = false;
    // 멈춘 채로 잠깐 있다가 놓았으면 미끄러지지 않게
    if (performance.now() - motion.lastTime > 80) motion.velocity = 0;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  return (
    <div
      className="worldwide-section"
      // JS 설정값을 CSS 변수로 넘겨서 SCSS 와 계산 기준을 하나로 맞춤
      style={{ "--radius-ratio": RADIUS_RATIO, "--slices": SLICES }}
    >
      <p className="worldwide-eyebrow">CARHARTT WIP WORLDWIDE</p>
      <h2 className="worldwide-title">Beyond Borders</h2>

      <div
        className={`worldwide-viewport${isDragging ? " is-dragging" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="worldwide-ring" ref={ringRef}>
          {/* 카드 16장 × 조각 10개 = 160개의 조각을 원 둘레에 세움 */}
          {SLOTS.flatMap((item, slot) =>
            Array.from({ length: SLICES }, (_, k) => {
              // 조각의 각도 = 카드 시작 각도 + (k + 0.5) 번째 조각 위치
              const angle =
                slot * SLOT_ANGLE - CARD_ANGLE / 2 + (k + 0.5) * SLICE_ANGLE;
              return (
                <div
                  key={`${slot}-${k}`}
                  className="worldwide-slice"
                  style={{ "--angle": `${angle}deg`, "--k": k }}
                >
                  {/* 조각마다 같은 이미지를 카드 크기로 깔고, k 번째 조각 위치만큼 왼쪽으로 밀어서
                      잘린 부분만 보이게 함 → 조각들이 모이면 한 장의 이미지가 됨 */}
                  <img
                    src={item.image || placeholder(item.id)}
                    // 대체 텍스트는 가운데 조각 하나에만 (스크린리더가 10번 읽지 않게)
                    alt={k === Math.floor(SLICES / 2) ? item.alt : ""}
                    draggable={false}
                  />
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* VIEW MORE : 회전 영역 아래. 지금은 아무 동작 없음
          shop 페이지를 만들면 아래 button 을 Link 로 바꾸면 됨
          (상단에 import { Link } from "react-router-dom"; 추가)
          <Link to="/shop" className="worldwide-btn">VIEW MORE</Link> */}
      <button type="button" className="worldwide-btn">
        EXPLORE STORES
      </button>
    </div>
  );
};

export default WorldWide;
