import { HeroSection } from "@/components/home/hero-section";
import { SearchBookingCard } from "@/components/home/search-booking-card";
import { PopularCategories } from "@/components/home/popular-categories";
import { FeaturedServices } from "@/components/home/featured-services";
import { TopRatedTechnicians } from "@/components/home/top-rated-technicians";
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

export default async function HomePage() {
  const user = await getMe();
  return (
    <>
      <div className="relative min-h-screen overflow-hidden ">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 right-0 h-px " />
          <div className="absolute -top-50 left-1/2 -translate-x-1/2 w-200 h-100  blur-[120px] rounded-full" />
          <div className="absolute bottom-12 left-10 w-72 h-72  blur-[80px] rounded-full" />
          <div className="absolute bottom-20 right-10 w-80 h-80  rounded-full" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370b_1px,transparent_1px),linear-gradient(to_bottom,#1f29370b_1px,transparent_1px)] bg-size-[4rem_4rem]" />
        </div>
        <div className="pointer-events-none absolute -top-24 right-0 -z-10 h-150 w-150 rounded-full bg-blue-400/55 blur-3xl" />
        <div className="pointer-events-none absolute top-1/6 right-0 -z-10 h-150 w-150 rounded-full bg-blue-500/55 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-0 -z-10 h-96 w-96 rounded-full bg-teal-400/55 blur-3xl" />
        <div className="pointer-events-none absolute top-1/10 -left-5 -z-10 h-150 w-200 rounded-full bg-teal-400/55 blur-3xl" />
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
