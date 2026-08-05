import AdminPaging from './AdminPaging';
import { useSelector } from 'react-redux';

const AdminQna = () => {
  const headCon = ['생성일', '유저명', '제목', '답변상태', ''];
  const type = 'community';
  // communitySlice에서 qna 게시판 글들 가져오기
  const { items: qnaList } = useSelector(state => state.community);
  return (
    <>
      <AdminPaging
        // qna작성자가 admin이 아닌경우만 데이터음넣음
        data={qnaList.filter((el, idx) => {
          if (el.author !== 'admin') {
            return el;
          }
        })}
        headCon={headCon}
        type={type}
      />
    </>
  )
}

export default AdminQna
