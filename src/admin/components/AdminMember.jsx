import { useSelector } from 'react-redux';
import AdminPaging from './AdminPaging';
const AdminMember = () => {
  const headCon = ['유저명','이메일','권한','상세보기'];
  const type = 'member';
  // authSlice에서 멤버리스트 가져오기
  const {memberData : memberList} = useSelector(state => state.authMember);
  return (
    <>
      <div className="adminMember">
        <div className="adminMember-con">
          <AdminPaging
                data={memberList}
                headCon = {headCon}
                type={type}
              />
        </div>
      </div>
    </>
  )
}

export default AdminMember
