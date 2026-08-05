import React, { useEffect, useState } from 'react'
import '../css/adminPaging.css'
import AdminDetailModal from './AdminDetailModal';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { deleteItem } from '../../items/slice/itemSlice';
import { removeOrderStore } from '../../community/slice/communityOrderStoreSlice';
import AdminPagingFooter from './common/AdminPagingFooter';
import AdminPagingHeader from './common/AdminPagingHeader';
import { deleteMemberList } from '../../auth/slice/authMemberListSlice';
import { adminStatusChange, filterData } from './common/AdminCommonFn';
import { checkUrlForModal } from '../../community/components/common/CommunityUtils';

const initSearchData = {
  searchFilter: '',
  searchDetail: ''
}
const AdminPaging = (props) => {
  // 전체 데이터를 저장하는 공간
  const [posts, setPosts] = useState(props.data);
  // 페이지 데이터 저장을 위한 변수
  const [page, setPage] = useState(1);

  // 검색data를 저장하기 위한 변수
  const [searchData, setSearchData] = useState(initSearchData);

  // 선택한 데이터를 저장하는 변수
  const [checkData, setCheckData] = useState([]);

  // 어떤 데이터를 선택했고, 해제했는지 저장하는 변수
  const [isChecked, setIsChecked] = useState(false);
  const [allChecked, setAllChecked] = useState(false);

  // 상세정보 페이지가 필요한 데이터를 idx별로 나누기위해 사용하는 변수
  const [detailData, setDetailData] = useState('');
  // 상세정보 modal페이지를 띄울지, 안띄울지 정하는 bool 변수
  const [isBool, setIsBool] = useState(false);

  // 주문 상태별 필터링 -> 기본값: 전체
  const [filterStatus, setFilterStatus] = useState('전체');
  // 필터링이 2가지일때를 위한 변수
  const [filterStatus2, setFilterStatus2] = useState('전체');

  // 외부 함수를 쓰기위한 dispatch 선언
  const dispatch = useDispatch();

  // 주소 이동을 위한 navigate 선언
  const navigate = useNavigate();

  // 커뮤니티 -> 모달창연결 (kyunam)
  const location = useLocation();

  // 컴포넌트에서 받은 테이블의 타입
  const tableType = props.type;
  // 컴포넌트에서 받은 테이블head 속성값
  const tableHead = props.headCon;

  // 총 데이터를 미리 넣어놓기
  useEffect(() => {
    checkUrlForModal(location, props.data, setDetailData, setIsBool); // 주소창 체크 함수실행(kyunam)
    setPosts(props.data);
    // props.data가 바뀌거나, searchData이 수정되면 실행
  }, [location.search, props.data, searchData])
  // 필터링데이터는 tableData에 넣음
  const tableData = filterData(posts,tableType,filterStatus,filterStatus2);
  // 필터링한 데이터의 총합 갯수
  const totalPost = tableData.length;

  // 화면에 보여줄 최대 데이터 갯수
  const pageRange = 6;
  // 화면에 보여줄 최대 버튼 갯수
  const btnRange = 5;

  // 마지막 페이지 계산
  const lastPage = Math.ceil(totalPost / pageRange);
  // 총 버튼의 갯수를 계산(버튼 이동 시 세트이동을 위한 변수)
  // 기획변경으로 사용X
  // const totalSet = Math.ceil(lastPage / btnRange);
  // 현재 보여질 페이지의 버튼을 계산
  const currentSet = Math.ceil(page / btnRange);

  // -1은 시작번호는 1이지만 배열로 따지면 0번부터 시작이기때문에 -1추가
  // 각각 시작페이지, 마지막페이지 변수
  const startPage = (currentSet - 1) * btnRange + 1;
  const endPage = startPage + btnRange - 1;

  // 해당하는 페이지안의 내용들
  // 각각 시작내용, 마지막내용 변수
  const startPost = (page - 1) * pageRange;
  const endPost = startPost + pageRange;

  // 공통 상세보기페이지 기능(현재 member, product만 사용)
  const onClickFn = (el) => {
    setDetailData(el);
    setIsBool(true);
  }
  // 공통 change기능
  const onChangeFn = (e) => {
    const { name, value } = e.target;
    setSearchData({ ...searchData, [name]: value });
  }
  // 공통 검색 기능
  const onSearchFn = (e) => {
    if (searchData === '') return;
    let res = '';
    switch (tableType) {
      case 'member':
        res = tableData.map((el, idx) => {
          if (el.userName.toLowerCase().includes(searchData.searchDetail.toLowerCase())) {
            return el
          }
        }).filter(res => res);
        break;
      // orderstore는 items db와 동일한 변수를 쓰기에 합쳐놓음
      case 'orderstore':
      case 'items':
        res = tableData.map((el, idx) => {
          if (el.name.toLowerCase().includes(searchData.searchDetail.toLowerCase())) {
            return el
          }
        }).filter(res => res);
        break;
      case 'order':
        res = tableData.map((el, idx) => {
          if (el.orderName.toLowerCase().includes(searchData.searchDetail.toLowerCase())) {
            return el
          }
        }).filter(res => res);
        break;
    }
    setPosts(res);
  }
  // 관리자페이지에서 삭제를해도 무방한 데이터만 적용
  // 공통 체크 기능 (현재 member, product, store만 사용)
  const onCheckedFn = (e, idx, item) => {
    // 체크가 되었을때 실행
    if (e.target.checked) {
      // 체크데이터는 체크한 아이템의 아이디를 저장(onclick에서 전달받음)
      setCheckData([...checkData, item.id]);
      // 체크유무 데이터는 몇번째 데이터를 체크했는지의 데이터를 저장
      setIsChecked({ ...isChecked, [idx]: e.target.checked });
      // 체크가 안되었을때 실행
    } else if (!e.target.checked) {
      // 체크를 해제하면 체크데이터에 저장한 것들 중
      // 체크를 해제한 쪽의 아이디를 필터링해서 제거
      setCheckData(checkData.filter(el => el !== item.id));
      setIsChecked({ ...isChecked, [idx]: e.target.checked });
    }
  };
  // 공통 체크 후 삭제기능(현재 member, product, store만 사용)
  const onRemoveFn = (e) => {
    if (checkData.length === 0) {
      alert('선택된 데이터가 없습니다.');
      return;
    }
    const isOk = confirm('선택한 데이터를 삭제하시겠습니까?');
    if (!isOk) return;
    // 체크데이터 안에(id)있는 것들에 해당하는 데이터 제거
    switch (tableType) {
      case 'items':
        checkData.forEach((el, idx) => {
          dispatch(deleteItem(el));
        })
        break;
      case 'member':
        checkData.forEach((el, idx) => {
          dispatch(deleteMemberList(el));
        })
        break;
      case 'orderstore':
        checkData.forEach((el, idx) => {
          dispatch(removeOrderStore(el));
        })
    }
    setIsChecked(false);
    setCheckData([]);
    alert('삭제되었습니다');
  }
  // 전체 체크박스 활성/비활성화 기능 함수
  const allCheckFn = (flag) => {

    if (!flag) {
      if (isChecked.length === (endPost - startPost)) {
        tableData.slice(startPost, endPost).forEach((el, idx) => {
          if (isChecked[idx]) {
            setCheckData(prev => prev.filter(e => e !== el.id));
            setIsChecked(prev => ({ ...prev, [idx]: false }));
          }
        })
      } else {
        setAllChecked(true);
        tableData.slice(startPost, endPost).forEach((el, idx) => {
          if (!isChecked[idx]) {
            setCheckData(prev => [...prev, el.id]);
            setIsChecked(prev => ({ ...prev, [idx]: true }));
          }
        })
      }
    } else {
      setAllChecked(false);
      tableData.slice(startPost, endPost).forEach((el, idx) => {
        if (isChecked[idx]) {
          setCheckData(prev => prev.filter(e => e !== el.id));
          setIsChecked(prev => ({ ...prev, [idx]: false }));
        }
      })
    }
  }
  return (
    <>
      {/* 페이징 공통 컨텐츠 */}
      {isBool &&
        <AdminDetailModal
          allData={props.data}
          setIsBool={setIsBool}
          type={tableType}
          getData={detailData}
        />}
      <div className="adminPaging">
        <div className="adminPaging-con">
          <AdminPagingHeader
            tableType={tableType}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterStatus2={filterStatus2}
            setFilterStatus2={setFilterStatus2}
            searchData={searchData}
            onSearchFn={onSearchFn}
            onChangeFn={onChangeFn}
            setPage={setPage}
          />
          <ul>
            <li>
              {tableType !== 'order' && tableType !== 'community' &&
                <span onClick={() => allCheckFn(allChecked)}
                  className='allCheck'>전체선택</span>}
              {tableHead && tableHead.map((el, idx) => {
                return <span key={idx}>{el}</span>
              })}
            </li>
            {/* posts에 들어있는 총 데이터를 현재 페이지의 처음글부터
        현재페이지의 마지막글 까지 잘라서 보여줌 */}
            {tableType && filterData && tableType === 'member' ? tableData.slice(startPost, endPost).map((el, idx) => {
              return (
                <li key={idx} className={isChecked[idx] ? "select" : ""}>
                  <label>
                    <span className='checkSpan'><input type="checkbox" name="select" id="select"
                      checked={isChecked[idx] || false}
                      onChange={() => onCheckedFn(event, idx, el)} /></span>
                    <span>{el.userName}</span>
                    <span>{el.userEmail}</span>
                    <span>{el.userRole}</span>
                    <span>
                      <Link onClick={() => onClickFn(el)}>상세보기</Link></span>
                  </label>
                </li>
              )
            }) : tableType === 'items' ? tableData.slice(startPost, endPost).map((el, idx) => {
              return (
                <li key={idx} className={isChecked[idx] ? "select" : ""}>
                  <label>
                    <span className='checkSpan'><input type="checkbox" name="select" id="select"
                      checked={isChecked[idx] || false}
                      onChange={() => onCheckedFn(event, idx, el)} /></span>
                    <span>{el.category}</span>
                    <span>
                      <Link onClick={() => navigate(`/${tableType}/${el.category}/detail/${el.id}`)}>
                      {el.name}</Link></span>
                    <span>{el.price}</span>
                    <span><img src={`/images/items_juhee/${el.image}`}
                      alt={el.image} /></span>
                    <span>
                      <Link onClick={() => onClickFn(el)}>상세보기</Link></span>
                  </label>
                </li>
              )
            }) : tableType === 'order' && tableData.length === 0 ?
              (
                <li className='noData'>
                  <span>
                    해당하는 주문 내역이 없습니다.
                  </span>
                </li>
              ) : tableType === 'order' ? tableData.slice(startPost, endPost).map((order, idx) => {
                // 주문상품 수량 총 합계
                const totalItemsCount = order.carts.reduce((sum, item) => sum + item.count, 0)
                return (
                  <li key={idx}>
                    <label>
                      <span>{new Date(order.orderDate).toLocaleString()}</span>
                      <span>{order.orderName}</span>
                      <span>
                        <Link onClick={() => onClickFn(order)}>
                        {order.carts[0].name} {order.carts.length > 1 ? ` 외 ${order.carts.length - 1}건` : ''}
                        <br />
                        <small>(총 {totalItemsCount}개)</small>
                        </Link>
                      </span>
                      <span>{order.totalPrice.toLocaleString()}원</span>
                      <span>
                        <span className={`method-badge ${order.orderPlace}`}>
                          {order.orderPlace}
                        </span>
                      </span>
                      <span>
                        <span className={`status-badge ${order.status}`}>
                          {order.status}
                        </span>
                      </span>
                      <span>
                        <select name="status-select" id="status-select" className="status-select"
                          value={order.status} onChange={(e) => adminStatusChange(order, e.target.value, dispatch)}>

                          {/* 공통(배달/매장) -> 주문완료 */}
                          <option value="주문완료" disabled={order.status !== "주문완료"}>
                            주문완료
                          </option>

                          {order.orderPlace === '배달' ? (
                            <>
                              {/* 배달 주문 */}
                              <option value="주문확인"
                                disabled={['주문확인', '배송중', '배송완료', '수령완료'].includes(order.status)}>
                                주문확인
                              </option>
                              <option value="배송중"
                                disabled={['배송중', '배송완료', '수령완료'].includes(order.status)}>
                                배송중
                              </option>
                              <option value="배송완료"
                                disabled={['배송완료', '수령완료'].includes(order.status)}>
                                배송완료
                              </option>
                              {/* 배달일 때 사용자가 수령 완료한 경우 표시만 해줌 */}
                              {order.status === '수령완료' && (
                                <option value="수령완료" disabled>수령완료</option>
                              )}
                            </>
                          ) : (
                            /* 매장 주문 */
                            <option value="수령완료" disabled={order.status === '수령완료'}>
                              수령완료
                            </option>
                          )}
                        </select>
                      </span>
                    </label>
                  </li>
                )
              }) : tableType === 'orderstore' ? tableData.slice(startPost, endPost).map((el, idx) => {
                return (
                  <li key={idx} className={isChecked[idx] ? "select" : ""}>
                    <label>
                      <span className='checkSpan'><input type="checkbox" name="select" id="select"
                        checked={isChecked[idx] || false}
                        onChange={() => onCheckedFn(event, idx, el)} /></span>
                      <span>{el.name}</span>
                      <span>{el.address}</span>
                      <span>{el.phone}</span>
                      <span><Link to={`/community/orderstore/write/${el.id}`} target='_blank'>수정</Link></span>
                    </label>
                  </li>
                )
              }) : tableType === 'community' && tableData.length === 0 ?
                (
                  <li className='noData'>
                    <span>
                      답변 목록이 없습니다.
                    </span>
                  </li>
                ) : tableType === 'community' ? tableData.slice(startPost, endPost).map((el, idx) => {
                  return (
                    <li key={idx}>
                      <label>
                        <span>{new Date(el.created_at).toLocaleString()}</span>
                        <span>{el.author}</span>
                        <span>{el.title}</span>
                        <span>{el.status}</span>
                        {el.status !== 'COMPLETED' ?
                          <span><Link to={`/community/qna/detail/${el.id}`} target='_blank'>답변</Link></span>
                          : <span><Link to={`/community/qna/detail/${el.id}`} target='_blank'>상세정보</Link></span>
                        }
                      </label>
                    </li>
                  )
                }) : <></>}
          </ul>
          {/* 페이징 컴포넌트의 푸터 */}
          <div className="adminPaging-footer">
            {/* 페이지 번호 기능 호출 */}
            <AdminPagingFooter
              page={page}
              btnRange={btnRange}
              startPage={startPage}
              lastPage={lastPage}
              setPage={setPage}
              setIsChecked={setIsChecked}
              onRemoveFn={onRemoveFn}
            />
            <div className="deleteBtn">
              {isChecked && checkData.length !== 0 &&
                <button onClick={onRemoveFn}>삭제</button>
              }
            </div>
          </div>
        </div>
      </div >
    </>
  )
}

export default AdminPaging
