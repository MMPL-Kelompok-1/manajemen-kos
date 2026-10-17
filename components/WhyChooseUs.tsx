import { Clock, Headset, ShieldCheck, Star, Zap } from "lucide-react";

export default function WhyChooseUs() {
  return (
    <section id="why" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider">Why choose us</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Experience the difference
            <br />
            in every detail.
          </h2>
        </div>
        <p className="max-w-sm text-zinc-500 md:text-right">
          We curate spaces that inspire. Every stay is more than just a bed—it&apos;s an experience.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {/* Kartu besar */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-50 p-10 md:col-span-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <ShieldCheck size={22} />
          </div>
          <h3 className="mt-8 text-2xl font-bold">Verified Quality</h3>
          <p className="mt-3 max-w-md text-zinc-500">
            Every home is verified for quality and comfort ensuring you get exactly what you see.
            No surprises, just perfection.
          </p>
          <ShieldCheck
            size={260}
            strokeWidth={1}
            className="pointer-events-none absolute -bottom-10 -right-10 text-zinc-200"
          />
        </div>

        {/* Kartu gelap */}
        <div className="rounded-3xl bg-zinc-950 p-10 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Star size={22} />
          </div>
          <h3 className="mt-8 text-2xl font-bold">5-Star Standards</h3>
          <p className="mt-3 text-zinc-400">
            We match any competitor&apos;s price for the same property.
          </p>
          <p className="mt-8 flex items-center gap-2 text-sm font-medium">
            Learn more <span aria-hidden>→</span>
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <Headset size={22} />
          </div>
          <h3 className="mt-8 text-2xl font-bold">Concierge</h3>
          <p className="mt-3 text-zinc-500">
            Personalized concierge service to help you book activities, dining, and transportation.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200 p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Clock size={22} />
          </div>
          <h3 className="mt-8 text-2xl font-bold">24/7 Support</h3>
          <p className="mt-3 text-zinc-500">Our dedicated team is available round the clock.</p>
        </div>

        <div className="rounded-3xl border border-zinc-200 p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600">
            <Zap size={22} />
          </div>
          <h3 className="mt-8 text-2xl font-bold">Instant Booking</h3>
          <p className="mt-3 text-zinc-500">
            Secure your dates instantly without waiting for approval.
          </p>
        </div>
      </div>
    </section>
  );
}
