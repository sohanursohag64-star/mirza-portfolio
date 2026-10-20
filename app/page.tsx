import Navbar from "@/components/public/Navbar";
import Hero from "@/components/public/Hero";
import StatisticsSection from "@/components/public/StatisticsCard";
import ProfileSection from "@/components/public/ProfileSection";
import LeadershipSection from "@/components/public/LeadershipCard";
import CareerTimeline from "@/components/public/CareerTimeline";
import LeadershipScaleSection from "@/components/public/TeamTerritorySection";
import TeamGrid from "@/components/public/TeamGrid";
import RegionTerritorySection from "@/components/public/RegionTerritorySection";
import ExpertiseSection from "@/components/public/ExpertiseCard";
import AchievementsSection from "@/components/public/AchievementCard";
import ActivitiesSection from "@/components/public/ActivityCard";
import GalleryGrid from "@/components/public/GalleryGrid";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatisticsSection />
        <ProfileSection />
        <LeadershipSection />
        <CareerTimeline />
        <LeadershipScaleSection />
        <TeamGrid />
        <RegionTerritorySection />
        <ExpertiseSection />
        <AchievementsSection />
        <ActivitiesSection />
        <GalleryGrid />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
