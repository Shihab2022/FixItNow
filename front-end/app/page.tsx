import { HeroSection } from "@/components/home/hero-section";
import { SearchBookingCard } from "@/components/home/search-booking-card";
import { PopularCategories } from "@/components/home/popular-categories";
import { FeaturedServices } from "@/components/home/featured-services";
// import { TopRatedTechnicians } from '@/components/home/top-rated-technicians';
// import { WhyChooseUs } from '@/components/home/why-choose-us';
// import { HowItWorks } from '@/components/home/how-it-works';
// import { Testimonials } from '@/components/home/testimonials';
// import { StatsSection } from '@/components/home/stats-section';
// import { TechnicianCTA } from '@/components/home/technician-cta';
// import { AppPromotion } from '@/components/home/app-promotion';
// import { FAQSection } from '@/components/home/faq-section';
// import { Newsletter } from '@/components/home/newsletter';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SearchBookingCard />
      <PopularCategories />
      <FeaturedServices />
      {/* <TopRatedTechnicians />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials />
      <StatsSection />
      <TechnicianCTA />
      <AppPromotion />
      <FAQSection />
      <Newsletter /> */}
    </>
  );
}
