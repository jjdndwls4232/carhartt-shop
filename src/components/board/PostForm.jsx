// ============================================================
// PostForm.jsx  (components/board 폴더 - 새로 만드는 파일)
// 역할: 글 작성 / 수정 화면을 "그리기" + 입력값 기억
//   위에서 아래 순서 : 제목·설명
//                    → 게시판 선택 / 제목 / 내용 / 첨부파일(드래그앤드롭)
//                    → 취소 / 등록하기 버튼 → 목록으로 돌아가기
//   저장(등록/수정)과 권한 검사는 부모인 BoardWritePage 가 담당
// props
//   - mode          : "write"(작성) 또는 "edit"(수정) → 제목과 버튼 글자가 달라짐
//   - initialValues : 처음 칸에 채워 둘 값 (수정할 때는 원래 글 내용)
//   - onSubmit      : 등록 버튼을 눌렀을 때 입력값을 넘겨 받을 함수
//   - onCancel      : 취소 버튼을 눌렀을 때 실행할 함수
// ============================================================
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronLeft,
  faCloudArrowUp,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { INQUIRY_TYPES } from "./boardData";
import "./PostForm.scss";

// ---------- 설정값 ----------
const MAX_CONTENT = 2000; // 내용 최대 글자 수
const MAX_FILES = 5; // 첨부파일 최대 개수
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 파일 하나 최대 크기 (10MB를 byte 로)

// 1536000 → "1.5 MB" 처럼 사람이 읽기 쉬운 크기로 바꿈
const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const PostForm = ({ mode, initialValues, onSubmit, onCancel }) => {
  const isEdit = mode === "edit";

  // ---------- 입력값 state ----------
  // initialValues 가 있으면(수정) 그 값으로, 없으면(작성) 빈 값으로 시작
  const [type, setType] = useState(initialValues?.type ?? INQUIRY_TYPES[0].value);
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  // 첨부파일 목록 : [{ name, size, type, url }, ...]
  const [files, setFiles] = useState(initialValues?.files ?? []);
  // 파일을 드롭존 위로 끌고 왔는지 (테두리 강조용)
  const [isDragging, setIsDragging] = useState(false);

  // 화면에 보이지 않는 진짜 <input type="file"> 을 가리킴
  //   "파일 선택" 버튼이나 드롭존을 누르면 이 input 을 대신 클릭해서 파일 창을 엶
  const fileInputRef = useRef(null);

  // ---------- 파일 추가 (파일 창 / 드래그앤드롭 공통) ----------
  const addFiles = (fileList) => {
    // FileList 는 진짜 배열이 아니라서 Array.from 으로 배열로 바꿈
    const picked = Array.from(fileList);

    const tooBig = picked.filter((file) => file.size > MAX_FILE_SIZE);
    if (tooBig.length > 0) {
      alert(`10MB를 넘는 파일은 첨부할 수 없습니다.\n${tooBig.map((f) => f.name).join("\n")}`);
    }

    // 남은 자리만큼만 받음 (이미 3개면 2개까지만)
    const room = MAX_FILES - files.length;
    const valid = picked.filter((file) => file.size <= MAX_FILE_SIZE);
    if (valid.length > room) {
      alert(`첨부파일은 최대 ${MAX_FILES}개까지 가능합니다.`);
    }

    const newFiles = valid.slice(0, Math.max(0, room)).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      // 브라우저 메모리에 있는 파일을 가리키는 임시 주소 (이미지 미리보기에 사용)
      url: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    // 같은 파일을 지웠다가 다시 고를 수 있도록 input 값을 비움
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- 드래그앤드롭 ----------
  // dragover 에서 preventDefault 를 해야 "여기에 놓을 수 있다"고 브라우저가 인식함
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); // 브라우저가 파일을 새 탭으로 열어버리는 기본 동작을 막음
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // ---------- 등록 ----------
  const handleSubmit = (e) => {
    e.preventDefault(); // form 제출 시 새로고침 막기
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    onSubmit({ type, title: title.trim(), content, files });
  };

  // "파일 선택" 옆에 보여줄 글자
  const fileSummary =
    files.length === 0
      ? "선택된 파일이 없습니다."
      : files.length === 1
        ? files[0].name
        : `${files[0].name} 외 ${files.length - 1}개`;

  return (
    <div className="write-page">
      {/* ---------- 상단 제목 ---------- */}
      <h1 className="write-title">{isEdit ? "글 수정" : "글 작성"}</h1>
      <p className="write-desc">궁금한 점이나 후기를 남겨주세요.</p>

      <form className="write-card" onSubmit={handleSubmit}>
        {/* ---------- 게시판 선택 ---------- */}
        {/* htmlFor 와 input 의 id 를 맞추면 글자(label)를 눌러도 입력칸이 선택됨 */}
        <div className="write-field">
          <label htmlFor="writeType" className="write-label">
            게시판 선택
          </label>
          <div className="write-select">
            <select
              id="writeType"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {INQUIRY_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FontAwesomeIcon icon={faChevronDown} className="write-select-icon" />
          </div>
        </div>

        {/* ---------- 제목 ---------- */}
        <div className="write-field">
          <label htmlFor="writeTitle" className="write-label">
            제목
          </label>
          <input
            id="writeTitle"
            type="text"
            className="write-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요."
            maxLength={100}
          />
        </div>

        {/* ---------- 내용 ---------- */}
        <div className="write-field">
          <label htmlFor="writeContent" className="write-label">
            내용
          </label>
          <textarea
            id="writeContent"
            className="write-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요."
            maxLength={MAX_CONTENT}
          />
          <p className="write-count">
            {content.length} / {MAX_CONTENT}
          </p>
        </div>

        {/* ---------- 첨부파일 ---------- */}
        <div className="write-field">
          <span className="write-label">
            첨부파일 <em>(선택)</em>
          </span>

          {/* 진짜 파일 input 은 숨기고, 아래 버튼/드롭존이 대신 눌러 줌 */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFileChange}
          />

          <div className="write-file-row">
            <button
              type="button"
              className="write-file-btn"
              onClick={() => fileInputRef.current.click()}
            >
              파일 선택
            </button>
            <span className="write-file-name">{fileSummary}</span>
          </div>

          <div
            className={`write-dropzone${isDragging ? " is-dragging" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current.click();
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FontAwesomeIcon icon={faCloudArrowUp} className="write-dropzone-icon" />
            <p>파일을 드래그하거나 클릭하여 첨부할 수 있습니다.</p>
            <small>(이미지, 문서 등 최대 {MAX_FILES}개 / 10MB 이하)</small>
          </div>

          {/* 첨부한 파일 목록 (하나라도 있을 때만) */}
          {files.length > 0 && (
            <ul className="write-file-list">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`}>
                  {file.type.startsWith("image/") && (
                    <img src={file.url} alt="" className="write-file-thumb" />
                  )}
                  <span className="write-file-info">
                    <span>{file.name}</span>
                    <small>{formatSize(file.size)}</small>
                  </span>
                  <button
                    type="button"
                    className="write-file-remove"
                    onClick={() => removeFile(index)}
                    aria-label={`${file.name} 삭제`}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---------- 버튼 ---------- */}
        <div className="write-actions">
          <button type="button" className="write-btn write-btn--outline" onClick={onCancel}>
            취소
          </button>
          <button type="submit" className="write-btn write-btn--primary">
            {isEdit ? "수정하기" : "등록하기"}
          </button>
        </div>
      </form>

      <Link to="/board-list" className="write-back">
        <FontAwesomeIcon icon={faChevronLeft} />
        목록으로 돌아가기
      </Link>
    </div>
  );
};

export default PostForm;
