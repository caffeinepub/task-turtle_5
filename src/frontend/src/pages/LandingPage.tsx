import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  ChevronRight,
  ClipboardList,
  Home,
  MapPin,
  Shield,
  ShoppingBag,
  Sofa,
  Turtle,
  Wallet,
  Wrench,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-brand-dark/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Turtle className="h-7 w-7 text-brand-green" />
            <span className="text-white font-bold text-xl">Task Turtle</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#how-it-works"
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              How it Works
            </a>
            <a
              href="#services"
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Services
            </a>
          </nav>
          <Button
            onClick={onGetStarted}
            className="rounded-full border border-white/30 bg-transparent text-white hover:bg-white/10 text-sm"
            data-ocid="nav.primary_button"
          >
            Login / Sign Up
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #0F3A22 0%, #0B0F0C 55%, #111612 100%)",
          minHeight: "90vh",
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, #2ECC71 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-8 pt-28 pb-24 flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm text-white/80">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            Live in Delhi NCR
          </div>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white"
            style={{ lineHeight: 1.05 }}
          >
            Any Task.
            <span className="text-brand-green"> Any Place.</span>
            <br />
            By Nearby People.
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            The hyper-local marketplace where you post real tasks and nearby
            people earn by doing them — in minutes, not days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button
              onClick={onGetStarted}
              className="rounded-full bg-brand-green text-brand-dark font-semibold px-8 py-5 text-base hover:bg-brand-green-hover shadow-glow transition-all"
              data-ocid="hero.primary_button"
            >
              Post a Task
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={onGetStarted}
              variant="ghost"
              className="rounded-full border border-white/20 text-white/80 hover:bg-white/10 px-8 py-5 text-base"
              data-ocid="hero.secondary_button"
            >
              Earn as a Tasker
            </Button>
          </div>
          <div className="flex gap-8 mt-6 text-center">
            {[
              { v: "2,400+", l: "Tasks Completed" },
              { v: "1,100+", l: "Active Taskers" },
              { v: "4.9★", l: "Avg Rating" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-white font-bold text-xl">{s.v}</div>
                <div className="text-white/50 text-xs mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-foreground">
              Post a Task in Seconds
            </h2>
            <p className="text-muted-foreground mt-2">
              From groceries to repairs — get anything done nearby.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Post Your Task",
                desc: "Describe what you need, set the amount & tip. Takes 30 seconds.",
                Icon: ClipboardList,
              },
              {
                step: "02",
                title: "Tasker Accepts",
                desc: "The nearest available tasker gets notified and accepts.",
                Icon: MapPin,
              },
              {
                step: "03",
                title: "OTP & Done",
                desc: "Share OTP on delivery. Payment releases automatically.",
                Icon: Shield,
              },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                <Card
                  className="rounded-2xl border-0 shadow-card overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #DFF7E8 0%, #BFEFCF 100%)",
                  }}
                >
                  <CardContent className="p-6">
                    <div className="text-4xl font-extrabold text-brand-forest/40 mb-4">
                      {s.step}
                    </div>
                    <s.Icon className="h-6 w-6 text-brand-forest mb-3" />
                    <h3 className="font-bold text-foreground text-lg">
                      {s.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {s.desc}
                    </p>
                    {i === 2 && (
                      <span className="inline-flex items-center mt-3 rounded-full bg-brand-dark text-white text-xs px-3 py-1">
                        How it Works
                      </span>
                    )}
                  </CardContent>
                </Card>
                {i < 2 && (
                  <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-brand-forest/50 hidden md:block z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Tiles */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-extrabold text-foreground mb-8">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div
              className="rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0F3A22 0%, #0B0F0C 100%)",
              }}
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-brand-green/10 blur-2xl" />
              <span className="text-brand-green text-xs font-semibold tracking-widest uppercase">
                For Customers
              </span>
              <h3 className="text-white font-bold text-xl">
                Customer Dashboard
              </h3>
              <p className="text-white/60 text-sm">
                Post tasks, track live progress on a map, generate OTP for
                secure delivery, and manage all your tasks in one place.
              </p>
              <Button
                onClick={onGetStarted}
                size="sm"
                className="w-fit rounded-full bg-brand-green text-brand-dark font-semibold hover:bg-brand-green-hover"
                data-ocid="features.primary_button"
              >
                Post a Task
              </Button>
              <div className="mt-2 rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
                {[
                  {
                    label: "Bring 1kg Bananas from Big Bazaar",
                    color: "bg-yellow-400",
                  },
                  {
                    label: "Pick up medicines from Apollo",
                    color: "bg-blue-400",
                  },
                  {
                    label: "Deliver documents to office",
                    color: "bg-brand-green",
                  },
                ].map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${t.color}`}
                    />
                    <span className="text-white/70">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #145A32 0%, #0F3A22 100%)",
              }}
            >
              <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-brand-green/10 blur-2xl" />
              <span className="text-brand-green text-xs font-semibold tracking-widest uppercase">
                For Taskers
              </span>
              <h3 className="text-white font-bold text-xl">Tasker Dashboard</h3>
              <p className="text-white/60 text-sm">
                Go online, see nearby tasks with distance, accept and earn.
                Track your wallet and earnings history in real time.
              </p>
              <Button
                onClick={onGetStarted}
                size="sm"
                className="w-fit rounded-full bg-brand-green text-brand-dark font-semibold hover:bg-brand-green-hover"
                data-ocid="features.secondary_button"
              >
                Start Earning
              </Button>
              <div className="mt-2 rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="text-white/50 text-xs mb-1">
                  Today&apos;s Earnings
                </div>
                <div className="text-brand-green font-bold text-2xl">₹840</div>
                <div className="text-white/40 text-xs mt-1">
                  6 tasks completed
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="md:col-span-1 rounded-3xl p-6 flex flex-col gap-3 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0B0F0C 0%, #0F3A22 100%)",
              }}
            >
              <MapPin className="h-6 w-6 text-brand-green" />
              <h3 className="text-white font-bold text-lg">
                Live Tracking & Map
              </h3>
              <p className="text-white/60 text-sm">
                Track your tasker in real-time. See exactly where they are on
                the map.
              </p>
              <div className="mt-auto rounded-xl bg-white/5 border border-white/10 h-20 flex items-center justify-center">
                <div className="flex gap-2 items-center text-white/40 text-xs">
                  <MapPin className="h-4 w-4 text-brand-green" />
                  <span>Live route tracking</span>
                </div>
              </div>
            </div>
            <div
              className="rounded-3xl p-6 flex flex-col gap-3"
              style={{
                background: "linear-gradient(135deg, #0F3A22 0%, #0B0F0C 100%)",
              }}
            >
              <Shield className="h-6 w-6 text-brand-green" />
              <h3 className="text-white font-bold text-lg">
                Escrow Protection
              </h3>
              <p className="text-white/60 text-sm">
                Payment locked in escrow. Released only on OTP verification.
              </p>
            </div>
            <div
              className="rounded-3xl p-6 flex flex-col gap-3"
              style={{
                background: "linear-gradient(135deg, #145A32 0%, #0B0F0C 100%)",
              }}
            >
              <Wallet className="h-6 w-6 text-brand-green" />
              <h3 className="text-white font-bold text-lg">Instant Wallet</h3>
              <p className="text-white/60 text-sm">
                Earnings hit your wallet instantly after task completion.
                Withdraw anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section id="services" className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-3">
            Popular Local Services
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Name it, and someone nearby can do it.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                Icon: ShoppingBag,
                label: "Grocery Delivery",
                desc: "From any nearby store in 30 mins",
              },
              {
                Icon: Home,
                label: "Home Cleaning",
                desc: "Professional cleaners at your door",
              },
              {
                Icon: Wrench,
                label: "Handyman",
                desc: "Repairs, plumbing, electrical",
              },
              {
                Icon: Sofa,
                label: "Furniture Assembly",
                desc: "IKEA builds, shifting, setup",
              },
            ].map((s, i) => (
              <Card
                key={s.label}
                className="rounded-2xl border border-border shadow-card hover:shadow-md transition-shadow cursor-pointer"
                data-ocid={`services.item.${i + 1}`}
              >
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-full bg-brand-mint flex items-center justify-center mb-3">
                    <s.Icon className="h-5 w-5 text-brand-forest" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">
                    {s.label}
                  </h3>
                  <p className="text-muted-foreground text-xs mt-1">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        className="py-16"
        style={{
          background: "linear-gradient(135deg, #0F3A22 0%, #0B0F0C 100%)",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Ready to get started?
          </h2>
          <p className="text-white/60 mb-6">
            Post your first task in under 30 seconds.
          </p>
          <Button
            onClick={onGetStarted}
            className="rounded-full bg-brand-green text-brand-dark font-bold px-10 py-5 text-base hover:bg-brand-green-hover shadow-glow"
            data-ocid="cta.primary_button"
          >
            Post a Task Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0D0B] text-white/60 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Turtle className="h-5 w-5 text-brand-green" />
                <span className="text-white font-bold">Task Turtle</span>
              </div>
              <p className="text-sm">Any Task. Any Place. By Nearby People.</p>
            </div>
            {[
              {
                heading: "Company",
                links: ["About Us", "Careers", "Blog", "Press"],
              },
              {
                heading: "Support",
                links: ["Help Center", "Safety", "Terms", "Privacy"],
              },
              {
                heading: "Social",
                links: ["Twitter", "Instagram", "LinkedIn", "YouTube"],
              },
            ].map((col) => (
              <div key={col.heading}>
                <h4 className="text-white font-semibold mb-3 text-sm">
                  {col.heading}
                </h4>
                <ul className="space-y-1.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <span className="text-sm cursor-pointer hover:text-white transition-colors">
                        {l}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 text-xs text-white/30">
            © {currentYear}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
