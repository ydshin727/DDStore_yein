import React, { useState } from 'react';
import '../../css/comment/communityPagination.css'



// ==============         페이징 관리 컨테이너        ======================

export const usePagenation = (data = [], itemsPerPage = 10) => {
  // 공용 페이징훅, 목록몇개씩보여줄것인지
  //페이징 상태관리 숫자에따라 보여지는 목록수가 달라짐
  //사용자가 검색을 누를때 검색내용이 적어질수있으므로 setCurrentPage(1) 호출하도록 Props로 초기화함수 넘겨주는게 좋다 (AI답변)
  const [currentPage, setCurrentPage] = useState(1)
  // 필터링된 데이터에서 현재 페이지에 해당하는 데이터만 추출
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem)
  //검색시 1페이지로 리셋
  const resetPage = () => setCurrentPage(1)

  return {
    currentPage,
    setCurrentPage,
    currentItems, // FaqContainer가 리스트를 그릴 때 사용
    resetPage,
    totalItems: data.length,
    itemsPerPage
  };
}

// 공용 페이징 컴포넌트
const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  // 전체 페이지 수 계산 ( Math.ceil은 소수점이하는 올림하여 정수로 환산)
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageGroupSize = 5 //한번에보여줄 페이지갯수 추후변경시 숫자변경  

  // 페이지 번호 배열 생성 (예: [1, 2, 3...])
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // 페이지가 1개 이하일 때는 페이징을 표시하지 않음
  if (totalPages <= 1) return null;

  // 페이지 계산
  const currentGroup = Math.ceil(currentPage / pageGroupSize)  //5페이지씩

  // 첫페이지 (1~5 -> 1페이지 , 6~10 -> 2페이지)
  const startPage = (currentGroup - 1) * pageGroupSize + 1; //시작페이지 (1,6,11 ...)
  // 마지막페이지는 totalPages 넘어가지않게
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages); //그룹 끝 페이지(5,10,15...)

  // 현재그룹에 해당하는번호만 배열
  const currentGroupNumber = [];
  for (let i = startPage; i <= endPage; i++) {
    currentGroupNumber.push(i)
  }

  return (
    <nav className="pagination-container">
      <ul className="pagination-list">
        {/* << 맨 처음으로 (1페이지로) */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button onClick={() => onPageChange(1)} disabled={currentPage === 1}>
            &lt;&lt;
          </button>
        </li>

        {/* < 이전 그룹으로 (현재 시작페이지 - 1) */}
        <li className={`page-item ${startPage === 1 ? 'disabled' : ''}`}>
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            &lt;
          </button>
        </li>

        {/* 페이지 번호 목록 (계산된 그룹만 출력) */}
        {currentGroupNumber.map(number => (
          <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <button onClick={() => onPageChange(number)}>
              {number}
            </button>
          </li>
        ))}

        {/* > 다음 그룹으로 (현재 끝페이지 + 1) */}
        <li className={`page-item ${endPage === totalPages ? 'disabled' : ''}`}>
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            &gt;
          </button>
        </li>

        {/* >> 맨 마지막으로 (totalPages로) */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
            &gt;&gt;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;