import '../../css/common/adminPagingFooter.css'

// 페이징 기능 중 하나인 페이지 번호 기능
const AdminPagingFooter = ({ page, btnRange, startPage, lastPage, setPage,
  setIsChecked
}) => {
  return (
    <div className="adminPaging-footer">
      {lastPage > 1&&
      <div className="adminPagingNum">
        {/* 가장 처음으로 돌아가는 버튼(가장처음일때 비활성화) */}
        
        <button className='first'
          onClick={() => { setPage(1); setIsChecked(false); }}
          disabled={page === 1}>
          &laquo;
        </button>
        
        {/* 이전버튼(1개씩만 이동) (가장처음일때 비활성화) */}

        <button className='prev'
          onClick={() => { setPage(page - 1); setIsChecked(false); }}
          disabled={page === 1}>
          &lt;
        </button>
        {/* 페이지 번호 (페이지가 하나뿐이면 안나옴) */}
        {Array.from({ length: btnRange }, (_, i) => {
          const pageNum = startPage + i;
          if (pageNum > lastPage) return null;
          else if (lastPage === 1) return null;
          return (
            <button
              key={pageNum}
              onClick={() => {
                setPage(pageNum)
                setIsChecked(false);
              }}
              className={page === pageNum ? 'active' : ''}
              disabled={page === pageNum}>
              {pageNum}
            </button>
          )
        })}
        {/* 다음버튼(1개씩만 이동) (가장 마지막일때 비활성화) */}
        <button className='next'
          onClick={() => { setPage(page + 1); setIsChecked(false); }}
          disabled={page === lastPage}>
          &gt;
        </button>
        {/* 가장 마지막으로 가는 버튼 (가장 마지막일때 비활성화) */}
        <button className='last'
          onClick={() => { setPage(lastPage); setIsChecked(false); }}
          disabled={page === lastPage}>
          &raquo;
        </button>
      </div>
      }
    </div>
  )
}

export default AdminPagingFooter
