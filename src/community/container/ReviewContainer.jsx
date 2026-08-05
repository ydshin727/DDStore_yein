import React from 'react'
import CommentPageContainer from '../../items/components/container/CommentPageContainer'
import { ScrollToTopButton } from '../components/common/CommunityUtils'

const ReviewContainer = () => {
  return (
    <div>
      <CommentPageContainer />
      <ScrollToTopButton/>
    </div>
  )
}

export default ReviewContainer