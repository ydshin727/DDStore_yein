import React, { useEffect, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import '../../css/searchPage.css'
import { API_JSON_SERVER_URL } from '../../../apis/commonApi'

const SearchPageContainer = () => {
  const url= API_JSON_SERVER_URL
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const keyword = params.get('keyword') || ''
  const page = Number(params.get('page')) || 1
  const ITEMS_PER_PAGE = 8

  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const currentPage = page

  /* 📦 전체 상품 fetch */
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${url}/items`)
        const data = await res.json()
        setItems(data)
      } catch (err) {
        alert('상품 불러오기 실패')
      }
    }
    fetchItems()
  }, [])

  /* 🔍 검색어 필터링 */
  useEffect(() => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(keyword.toLowerCase())
    )
    setFilteredItems(filtered)
  }, [items, keyword])

  /* 📄 페이징 계산 */
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const pagedItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )
  const handlePageChange = (pageNumber) => {
    navigate(`/items/search?keyword=${keyword}&page=${pageNumber}`)
  }

  return (
    <div className="search-page">
      <h2>
        검색 결과 <span>“{keyword}”</span>
      </h2>

      {filteredItems.length === 0 ? (
        <p className="empty">검색 결과가 없습니다.</p>
      ) : (
        <>
          <ul className="search-list">
            {pagedItems.map(item => (
              <li key={item.id}>
                <Link to={`/items/${item.category}/detail/${item.id}`}>
                  <img
                    src={`/images/items_juhee/${item.image}`}
                    alt={item.name}
                  />
                  <p className="name">{item.name}</p>
                  <p className="price">
                    {item.price.toLocaleString()}원
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* 🔢 pagination */}

          <div className="pagination">
            {totalPages === 0 ? (
              <>
                <button className="arrow" disabled>&#171;</button>
                <button className="arrow" disabled>&#8249;</button>
                <button className="active">1</button>
                <button className="arrow" disabled>&#8250;</button>
                <button className="arrow" disabled>&#187;</button>
              </>
            ) : (
              <>
                <button
                  className="arrow"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(1)}
                >
                  &#171;
                </button>

                <button
                  className="arrow"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  &#8249;
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={currentPage === i + 1 ? 'active' : ''}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="arrow"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  &#8250;
                </button>

                <button
                  className="arrow"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(totalPages)}
                >
                  &#187;
                </button>

              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default SearchPageContainer
