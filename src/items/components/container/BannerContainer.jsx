import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import { Link } from 'react-router-dom'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import '../../css/bannerContainer.css'

const BannerContainer = () => {
  return (
    <section className="bannerContainer">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation
        loop={true}
      >
        <div className="banner-con">
          <SwiperSlide>
            <Link to="http://localhost:3000/items/search?keyword=%EB%85%B8%EC%A6%88%EC%9B%8C%ED%81%AC">
              <img src="/images/items_juhee/banner1.jpg" alt="배너1" />
            </Link>
          </SwiperSlide>

          <SwiperSlide>
            <Link to="/items/feed/detail/13">
              <img src="/images/items_juhee/banner2.jpg" alt="배너2" />
            </Link>
          </SwiperSlide>

          <SwiperSlide>
            <Link to="/items/living/detail/20">
              <img src="/images/items_juhee/banner3.jpg" alt="배너3" />
            </Link>
          </SwiperSlide>

        </div>
      </Swiper>
    </section>
  )
}

export default BannerContainer
