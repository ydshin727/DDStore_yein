import React, { useMemo } from 'react'
import { useSelector } from 'react-redux';


// ===========     게시판 고정글,최신순 정렬 훅         =================

const useCommunitySorted = (items) => {
  // Redux에서 현재 정렬 설정(key, direction)을 가져옵니다.
  const { sortConfig } = useSelector(state => state.community);

  return useMemo(() => {

    if (!items) return [];

    // 원본 보존을 위해 복사본 생성
    const sorted = [...items];

    sorted.sort((a, b) => {
      // is_fixed가 앞에오도록
      if (a.is_fixed !== b.is_fixed) {
        return a.is_fixed ? -1 : 1
      }
      // 고정글은 정렬 되지 않음
      if (a.is_fixed && b.is_fixed) {
        return new Date(b.created_at) - new Date(a.created_at);
      }

      if (sortConfig.key) {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // 날짜 데이터인 경우 Date 객체로 변환하여 비교
        if (sortConfig.key === 'updated_at' || sortConfig.key === 'created_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
      }
      return 0;
    })
    return sorted;
  }, [items, sortConfig]);
};


export default useCommunitySorted