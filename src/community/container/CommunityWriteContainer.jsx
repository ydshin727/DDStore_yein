import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import '../css/container/communityWriteContainer.css'
import { useDispatch, useSelector } from 'react-redux'
import { checkCommunityAndRestoreRestriction, clearDetail, fetchCommunityDetail, restrictUser, searchCommunity } from '../slice/communitySlice'
import useTextLimit from '../hooks/useTextLimit'
import CommunityAPI from '../communityApis/CommunityAPI'
import { getCategoryName, ScrollToTopButton } from '../components/common/CommunityUtils'
import useCommunityAuth from '../hooks/useCommunityAuth'

//============        게시판 (수정,글쓰기) 컨테이너        =======================

const CommunityWriteContainer = () => {
  const { id } = useParams() // URL에 id가있으면 수정 모드
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()


  //슬라이스 가져오기 (authSlice저장된 auth = 권한정보 , communitySlice에 저장된 tagOptions,detail)
  const auth = useSelector(state => state.auth)
  const { tagOptions, detail, activeRestriction } = useSelector(state => state.community)
  // 현재 url 경로를 통해 카테고리 추출 ex) /community/notice/write =>
  const categoryPath = location.pathname.split('/')[2] || 'notice'
  //방어로직 훅
  const { isAdmin, user } = useCommunityAuth(categoryPath, isEdit)
  //글자제한 훅
  const titleInput = useTextLimit("", 50)
  const contentInput = useTextLimit("", 300)

  // role별 태그 필터링, 공지 태그는 관라자만 노출
  const roleTags = tagOptions[categoryPath]?.filter(tag => {
    if (tag.value === 'alert' && auth.isUser?.userRole !== 'ROLE_ADMIN') return false;
    return true;
  }) || [];

  const [communityData, setCommunityData] = useState(
    {
      user_id: auth.isUser?.id || "", //id가져오기
      category: categoryPath,
      tag: roleTags.length > 0 ? roleTags[0].value : "",
      is_fixed: false,
      status: categoryPath === 'qna' ? 'PENDING' : undefined  //첫 글작성시(qna) 초기값설정 (답변대기상태)
    }
  )

  // 데이터불러오기 (정지유저도 확인)
  useEffect(() => {
    if (isEdit) { dispatch(fetchCommunityDetail(id)) }
    if (auth.isUser?.id) dispatch(checkCommunityAndRestoreRestriction(auth.isUser.id))
    return () => { dispatch(clearDetail()) }
  }, [id, isEdit, dispatch, auth.isUser?.id])


  // 불러온 데이터를 상태에 반영 + 본인 확인 로직
  useEffect(() => {
    if (isEdit && detail) {
      if (String(detail.user_id) !== String(auth.isUser?.id) && auth.isUser?.userRole !== 'ROLE_ADMIN') {
        alert("본인이 작성한 글만 수정할 수 있습니다")
        navigate(-1)
      }
      setCommunityData(detail)
      titleInput.setValue(detail.title)
      contentInput.setValue(detail.content)
    }
  }, [isEdit, detail, auth, navigate])

  // form 입력 데이터 전송함수
  const handleSubmit = async (e) => {
    e.preventDefault() // 새로고침방지 (ai...)

    //제목이없거나 내용이없을때
    if (!titleInput.value.trim() || !contentInput.value.trim()) return alert("제목과 내용을 입력해주세요.")
    // 정지 유저 방어: 1:1문의(secret)가 아닌데 정지 상태인 경우 차단
    if (activeRestriction && communityData.tag !== 'secret') {
      alert(`현재 활동 제한 상태입니다.(사유: ${activeRestriction.reason})\n 1:1문의만 이용가능합니다.`);
      return
    }
    if (!isEdit && !window.confirm("게시글을 등록하시겠습니까?")) return;

    //
    const postData = {
      ...communityData,
      title: titleInput.value,
      content: contentInput.value,
      // 세부DB (없으면 누락되서 category === 'notice'에서 걸러짐)
      category: categoryPath, // 현재 카테고리 (notice, faq 등)
      author: user?.userName || auth.isUser?.userName,
      user_id: user?.id || auth.isUser?.id,
      updated_at: new Date().toISOString(),
      ...(isEdit ? {} : { created_at: new Date().toISOString(), view_count: 0 })
    }

    try {
      if (isEdit) {
        if (!confirm("수정 하시겠습니까?"))
          return
        // 수정
        await CommunityAPI.updateCommunityPost(id, postData)
        alert("수정이 완료되었습니다.")
      } else {
        //글쓰기등록
        await CommunityAPI.createCommunityPost(postData)
        alert('등록되었습니다.')
      }
      navigate(`/community/${categoryPath}`)
    } catch (err) {
      alert("문제가 발생했습니다. 다시 시도해 주세요.")
    }
  }

  //화면 보이기 방지용 (Ai)
  if (!auth.isState) return null;

  return (
    <div className="community-write">
      <div className="community-write-con">
        <h2> {getCategoryName(categoryPath)} {isEdit ? '수정' : '작성'} </h2>
        {/* 전송함수 */}
        <form onSubmit={handleSubmit}>
          <div className="write-options">
            {/* 태그선택 */}
            <select name='tag' value={communityData.tag} onChange={(e) => setCommunityData(prev => ({ ...prev, tag: e.target.value }))}>
              {roleTags.map(opt => <option key={opt.value} value={opt.value}> {opt.label} </option>)}
            </select>

            {/* 상단고정 체크 */}
            {isAdmin && (
              <label className="fixed-checkbox">
                <input type="checkbox" checked={communityData.is_fixed || false}
                  onChange={(e) => setCommunityData(prev => ({ ...prev, is_fixed: e.target.checked }))}
                />
                상단 고정
              </label>
            )}

            {/* 제목 */}
            <div className="input-wrapper">
              <input value={titleInput.value} onChange={titleInput.handleChange} placeholder='제목을 입력하세요' />
              <span className={`char-count ${titleInput.isLimit ? 'max' : ''}`}>
                {titleInput.currentLength} /{titleInput.maxLength}
              </span>
            </div>

            {/* 본문 */}
            <div className="textarea-wrapper">
              <textarea value={contentInput.value} onChange={contentInput.handleChange} placeholder='내용을 입력하세요' />
              <span className={`char-count ${contentInput.isLimit ? 'max' : ''}`}> {contentInput.currentLength} / {contentInput.maxLength} </span>
            </div>

            {/* 버튼 */}
            <div className="btn">
              <button type='button' className='cancel-btn' onClick={() => navigate(-1)}> 취소  </button>
              <button type='submit' className='submit-btn' >  저장   </button>
            </div>


          </div>
        </form>
        <ScrollToTopButton />
      </div>
    </div>
  )
}

export default CommunityWriteContainer