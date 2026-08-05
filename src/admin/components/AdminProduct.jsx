import { useSelector } from 'react-redux';
import AdminPaging from './AdminPaging';



const AdminProduct = () => {
  const headCon = ['카테고리', '제품명', '가격', '이미지', '상세보기'];
  const type = 'items';
   // itemsSlice에서 아이템리스트 가져오기
  const { data: productList} = useSelector(state =>state.item);
  return (
    <>
      <div className="adminProduct">
        <div className="adminProduct-con">
          <AdminPaging
                data={productList}
                headCon = {headCon}
                type = {type}
              />
        </div>

      </div>
    </>
  )
}

export default AdminProduct
