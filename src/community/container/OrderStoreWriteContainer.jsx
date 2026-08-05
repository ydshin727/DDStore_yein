import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { addOrderStore, fetchOrderStoresDetail, updateOrderStore } from '../slice/communityOrderStoreSlice'
import KakaoMapApi from '../../apis/kakaoApi/KakaoMapApi'
import '../css/container/orderStoreWrite.css'
import { ScrollToTopButton } from '../components/common/CommunityUtils'


const OrderStoreWriteContainer = () => {
  const { id } = useParams() // url id잇으면 수정모드
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { orderstores } = useSelector(state => state.orderstore)
  const auth = useSelector(state => state.auth)

  // 매장 초기데이터
  const [storeData, setStoreData] = useState({
    name: '',
    address: '',
    phone: '',
    lat: 37.5665, //기본값
    lng: 126.9780,
    detailAddress: ''
  })

  // 수정모드일때 기존데이터 로드
  useEffect(() => {
    // 수정 모드일 때
    if (isEdit && id) {
      // 리덕스 스토어에 이미 데이터가 있는지 확인
      const target = orderstores.find(el => String(el.id) === String(id));

      if (target) {
        // 스토어에 데이터가 있으면 바로 세팅
        setStoreData(target);
      } else {
        // 새로고침 등으로 스토어가 비어있다면 서버에서 직접 가져옴
        dispatch(fetchOrderStoresDetail(id))
          .unwrap()
          .then(data => {
            setStoreData(data);
          })
          .catch(() => {
            alert("데이터를 불러오는데 실패했습니다.");
            navigate('/community/orderstore');
          });
      }
    }
  }, [id, isEdit, dispatch, navigate, orderstores]);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target
    setStoreData(prev => ({ ...prev, [name]: value }))
  }

  // 지도 클릭시 좌표업데이트
  const handleMapClick = (coords) => {
    setStoreData(prev => ({
      ...prev,
      lat: coords.lat,
      lng: coords.lng
    }))
  }

  // 지도 클릭시 실행
  const handleMapSelect = (data) => {
    setStoreData(prev => ({
      ...prev,
      address: data.address,
      lat: data.lat,
      lng: data.lng
    }))
  }

  // 주소 검색 버튼 클릭시 실행
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const fullAddress = data.address //검색주소

        // 주소창입력
        setStoreData(prev => ({ ...prev, address: fullAddress }))
        // 카카오 Geocoder를 사용하여 주소를 좌표로 변환
        const geocoder = new window.kakao.maps.services.Geocoder()
        geocoder.addressSearch(fullAddress, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            // 변화된 좌표를 상태에 저장 (자동으로 지도위치이동)
            setStoreData(prev => ({
              ...prev,
              lat: parseFloat(result[0].y),
              lng: parseFloat(result[0].x)
            }))
          }
        })
      }
    }).open()
  }

  //텍스트 주소검색
  const handleSearch = (e) => {
    if (e) e.preventDefault // 폼 제출 방지
    if (!storeData.address.trim()) return alert("주소를 입력해주세요")

    const geocoder = new window.kakao.maps.services.Geocoder()
    geocoder.addressSearch(storeData.address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setStoreData(prev => ({
          ...prev,
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x)
        }))
      } else {
        alert("해당주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요")
      }
    })
  }



  // 입력값 전송함수
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!storeData.name || !storeData.address) return alert("매장명과 주소를 입력해주세요.")


    //수정일때 등록일때 상황에 맞게
    const confirmMessage = isEdit ? "매장 정보를 수정하시겠습니까?" : "신규매장을 등록하시겠습니까?"
    if (!confirm(confirmMessage)) return
    if (isEdit) {
      dispatch(updateOrderStore({ id, storeData }))
        .unwrap()
        .then(() => {
          alert('수정되었습니다.')
          navigate('/community/orderstore')
        })
        .catch((err) => alert("수정에 실패했습니다."))
    } else {
      dispatch(addOrderStore(storeData))
        .unwrap()
        .then(() => {
          alert("등록 되었습니다.")
          navigate('/community/orderstore')
        })
        .catch((err) => alert("등록에 실패했습니다."))
    }
  }

  // 권리자아닐시 내보내기
  useEffect(() => {
    // auth 정보가 아직 확인되지 않았으면 대기
    if (auth.isState === null) return;

    if (!auth.isState) {
      alert("로그인이 필요합니다.");
      navigate('/auth/login');
      return;
    }

    // 관리자 여부 확인
    if (auth.isUser?.userRole !== 'ROLE_ADMIN') {
      alert("관리자만 매장 등록/수정이 가능합니다.");
      navigate('/community/orderstore');
    }
  }, [auth.isState, auth.isUser, navigate]);


  return (
    <div className="store-write">

      <h2>{isEdit ? '매장 정보수정' : '신규매장 등록'}</h2>

      <div className="store-write-con">
        {/* 좌표가져오기(보여주기) onSelect = props로 함수전달 */}
        <KakaoMapApi lat={storeData.lat} lng={storeData.lng} onSelect={handleMapSelect} />

        <form onSubmit={handleSubmit}>

          <div className="search-row">
            <input name="address" value={storeData.address} onChange={handleChange} readOnly />
            <button type="button" onClick={handleAddressSearch}> 주소검색 </button>
          </div>

          <input name="detailAddress" value={storeData.detailAddress} placeholder='상세주소' onChange={handleChange}></input>
          <input name="name" value={storeData.name} placeholder='매장명' onChange={handleChange} />
          <input name="phone" value={storeData.phone} placeholder='매장번호' onChange={handleChange} />

          <div className="button-group">
            <button type="button" className='cancel-btn' onClick={() => navigate(-1)}>취소</button>
            <button type="submit">{isEdit ? '수정' : '매장등록'}</button>
          </div>

        </form>

      </div>
      <ScrollToTopButton />
    </div>
  )
}

export default OrderStoreWriteContainer