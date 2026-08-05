import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { API_JSON_SERVER_URL } from '../../apis/commonApi'

// yein - 추천 상품 모듈화

export const useRecommend = (excludeItems = []) => {
  const url = API_JSON_SERVER_URL
  // 전체 상품 DB
  const [dbItems, setDbItems] = useState([])
  // 모달 표시 여부
  const [showModal, setShowModal] = useState(false)
  // 추천 랜덤 상품 2개
  const [recommendItems, setRecommendItems] = useState([])

  // 전체 상품 데이터 불러오기
  useEffect(() => {
    const fetchDbItems = async () => {
      try {
        const res = await axios.get(`${url}/items`) 
        setDbItems(res.data)
      } catch (err) {
        alert("상품을 불러오는데 실패했어요.")
      }
    }
    fetchDbItems()
  }, [])

  // 추천 상품 필터링 및 랜덤 추출
  const openRecommendModal = useCallback(() => {
    if (dbItems.length === 0) return false
    // 현재 페이지에서 보고 있거나 이미 담은 상품 ID 추출
    const excludeIds = excludeItems.map(item => item.itemId || item.id)
    //  전체 DB 아이템에서 제외 상품을 뺀 나머지만 필터링
    const filtered = dbItems.filter(item => !excludeIds.includes(item.id))
    if (filtered.length > 0) {
      // 추천할 상품이 있다면 -> 추천 상품 랜덤 2개 뽑기, 모달 띄우기
      const random = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 2)
      setRecommendItems(random)
      setShowModal(true)
      return true
    }
    // 추천할 상품이 없다면 -> false 반환
    return false
  }, [dbItems, excludeItems])

  // 모달창 닫기
  const closeRecommendModal = useCallback(() => {
    setShowModal(false)
  }, [])

  return { dbItems, showModal, recommendItems, openRecommendModal, closeRecommendModal }
}

export default useRecommend