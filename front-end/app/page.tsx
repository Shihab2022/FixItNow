import { HeroSection } from "@/components/home/hero-section";
import { SearchBookingCard } from "@/components/home/search-booking-card";
import { PopularCategories } from "@/components/home/popular-categories";
import { FeaturedServices } from "@/components/home/featured-services";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { StatsSection } from "@/components/home/stats-section";
import { TechnicianCTA } from "@/components/home/technician-cta";
// import { FAQSection } from "@/components/home/faq-section";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getMe } from "@/service/auth";
import AboutSection from "@/components/home/about";
import ContactSection from "@/components/home/ContactSection";
import Background from "@/components/home/background";
import TopRatedTechnicians from "@/components/home/top-rated-technicians";

export default async function HomePage() {
  const user = await getMe();
  return (
    <>
      <div className="relative min-h-screen overflow-hidden ">
        <Background />
        <Header user={user?.data?.data || {}} />
        <HeroSection />
        <SearchBookingCard />
        <PopularCategories />
        <FeaturedServices />
        <AboutSection />
        <TopRatedTechnicians />
        <WhyChooseUs />
        <HowItWorks />
        <Testimonials />
        <StatsSection />
        <TechnicianCTA />
        {/* <FAQSection /> */}
        <ContactSection />
        <Footer />
      </div>
    </>
  );
}
