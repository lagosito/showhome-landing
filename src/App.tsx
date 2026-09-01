import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Audiences } from "./components/Audiences";
import { HowItWorks } from "./components/HowItWorks";
import { BeforeAfter } from "./components/BeforeAfter";
import { Benefits } from "./components/Benefits";
import { Customers } from "./components/Customers";
import { UseCases } from "./components/UseCases";
import { Pricing } from "./components/Pricing";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-paper text-ink antialiased">
      <a
        href="#product"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Audiences />
        <HowItWorks />
        <BeforeAfter />
        <Benefits />
        <Customers />
        <UseCases />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
