import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useAnimation } from "framer-motion";

const MotionLink = motion(Link);

const phoneImgs = [
  "https://source.unsplash.com/800x600/?featurephone,woman,africa",
  "https://source.unsplash.com/800x600/?sms,phone,africa,woman",
  "https://source.unsplash.com/800x600/?village,africa,women",
];

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
};

function AnimatedSection({ children, className = "", ...rest }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("animate");
  }, [isInView, controls]);

  return (
    <motion.section
      ref={ref}
      initial="initial"
      animate={controls}
      variants={fadeInUp}
      transition={{ duration: 0.6 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.section>
  );
}

function Stat({ label, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="rounded-xl bg-white/70 backdrop-blur p-4 text-center shadow hover:shadow-md transition-all duration-300"
    >
      <div className="text-2xl font-bold text-rose-700">{value}</div>
      <div className="text-xs text-slate-600">{label}</div>
    </motion.div>
  );
}

function Feature({ title, desc, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.4, delay }}
      viewport={{ once: true }}
      className="rounded-2xl bg-white p-5 shadow hover:shadow-lg transition-all duration-300 group cursor-pointer"
    >
      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors duration-300">
        <span className="text-amber-700 text-lg">{icon}</span>
      </div>
      <h4 className="font-semibold text-slate-800 group-hover:text-rose-700 transition-colors duration-300">
        {title}
      </h4>
      <p className="text-sm text-slate-600 mt-1">{desc}</p>
    </motion.div>
  );
}

function StepCard({ step, title, description, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="rounded-2xl bg-white p-5 shadow border border-rose-100 hover:shadow-md transition-all duration-300 group"
    >
      <div className="text-rose-700 text-sm font-bold group-hover:scale-110 transition-transform duration-300">
        Step {step}
      </div>
      <div className="font-semibold text-slate-900 mt-1">{title}</div>
      <p className="text-sm text-slate-600 mt-2">{description}</p>
    </motion.div>
  );
}

export default function Home() {
  const heroControls = useAnimation();

  useEffect(() => {
    heroControls.start({ opacity: 1, y: 0 });
  }, [heroControls]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-amber-50 to-white overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-5 pt-10 pb-8 md:pt-14">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <motion.img
            src="/logo.svg"
            alt="Reform Her logo"
            className="h-10 w-10 object-contain"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <h1 className="text-3xl md:text-4xl font-extrabold text-rose-800 tracking-tight">
            Reform Her
          </h1>
        </motion.header>

        <div className="mt-6 grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
              Personalized micro-lessons for women — on{" "}
              <span className="text-rose-600">any</span> phone.
            </h2>
            <motion.p
              className="mt-3 text-slate-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              We deliver daily, bite-sized lessons via <b>USSD</b> &amp; <b>SMS</b>{" "}
              in <span className="underline decoration-amber-400 decoration-4">local languages</span> —
              covering <b>health</b>, <b>business</b> and <b>agriculture</b>. No data. No smartphone required.
            </motion.p>

            <motion.div
              className="mt-5 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.a
                href="#how"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-white font-semibold shadow hover:bg-rose-700 transition-colors duration-300"
              >
                See how it works
              </motion.a>
              <motion.a
                href="#features"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-5 py-3 text-amber-800 font-semibold shadow hover:bg-amber-200 transition-colors duration-300"
              >
                Explore features
              </motion.a>
            </motion.div>

            <motion.div
              className="mt-6 grid grid-cols-3 gap-3 max-w-md"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <Stat label="Languages at launch" value="EN / SW / FR" delay={0} />
              <Stat label="Daily lesson completion" value="~76%" delay={0.1} />
              <Stat label="Avg. quiz score" value="4.2 / 5" delay={0.2} />
            </motion.div>

            <motion.p
              className="mt-4 text-sm text-slate-600"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              Pilot dialing example: <b>*123#</b> (USSD) • SMS opt-in: <b>JOIN</b>.
              <br />*Numbers are illustrative for demo.
            </motion.p>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <motion.div
              className="absolute -inset-3 bg-rose-200/40 blur-2xl rounded-[2rem]"
              animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.div
              className="relative grid grid-cols-3 gap-2 rounded-[1.5rem] overflow-hidden shadow-2xl ring-1 ring-rose-100"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {phoneImgs.map((src, i) => (
                <motion.img
                  key={i}
                  src={src}
                  alt="Women using keypad phones"
                  className="aspect-[3/4] object-cover"
                  loading="lazy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                />
              ))}
            </motion.div>
            <motion.div
              className="mt-3 text-xs text-slate-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              Representative images. Replace with your field photos for the demo.
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <AnimatedSection id="how" className="max-w-6xl mx-auto px-5 py-12">
        <motion.h3 className="text-xl md:text-2xl font-bold text-slate-900 text-center" variants={fadeInUp}>
          How it works
        </motion.h3>
        <motion.div className="mt-8 grid md:grid-cols-4 gap-6" variants={staggerContainer}>
          {[
            ["Dial", "Women dial a short code (USSD) on any phone — no data needed."],
            ["Personalize", "A quick survey sets language, region, interests and delivery time."],
            ["Learn daily", "Receive 1–2 minute lessons by SMS; take short quizzes to reinforce."],
            ["Level up", "Earn certificates, get helpline support, and unlock micro-finance tips."],
          ].map(([title, description], index) => (
            <StepCard key={index} step={index + 1} title={title} description={description} index={index} />
          ))}
        </motion.div>
      </AnimatedSection>

      {/* Features */}
      <AnimatedSection
        id="features"
        className="max-w-6xl mx-auto px-5 py-12 bg-rose-50/30 rounded-3xl mb-8"
      >
        <motion.h3 className="text-xl md:text-2xl font-bold text-slate-900 text-center" variants={fadeInUp}>
          Built for real-world barriers
        </motion.h3>
        <motion.p className="text-slate-700 mt-2 text-center max-w-2xl mx-auto" variants={fadeInUp}>
          Reform Her removes friction where infrastructure is limited and time is scarce.
        </motion.p>
        <motion.div className="mt-8 grid md:grid-cols-3 gap-6" variants={staggerContainer}>
          <Feature
            title="Health literacy"
            icon="❤"
            delay={0}
            desc="Trusted maternal & community health tips (≤160 chars) with escalation to a helpline for red-flags."
          />
          <Feature
            title="Business skills"
            icon="₿"
            delay={0.1}
            desc="Record-keeping, pricing, marketing, savings groups, micro-finance basics & compliance guidance."
          />
          <Feature
            title="Climate-smart agriculture"
            icon="🌱"
            delay={0.2}
            desc="Region-aware practices: crop rotation, mulching, water, post-harvest handling and market timing."
          />
          <Feature
            title="Personalized"
            icon="✨"
            delay={0.3}
            desc="Lessons adapt to language, literacy, quiz performance and chosen topics."
          />
          <Feature
            title="Certifications"
            icon="🎓"
            delay={0.4}
            desc="Short assessments issue shareable badges for employers, groups and lenders."
          />
          <Feature
            title="USSD + SMS"
            icon="☎"
            delay={0.5}
            desc="Works on keypad phones. Low cost, offline-friendly, and reliable."
          />
        </motion.div>
      </AnimatedSection>

      {/* Outcomes / why it matters */}
      <AnimatedSection className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            className="rounded-3xl bg-amber-50 p-6 shadow-inner border border-amber-100"
            whileInView="animate"
            initial="initial"
            variants={scaleIn}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl md:text-2xl font-bold text-amber-900">Why it changes lives</h3>
            <motion.ul className="mt-4 space-y-3 text-slate-700 text-sm" variants={staggerContainer}>
              {[
                "Converts idle minutes into learning and real income improvements.",
                "Bypasses data, smartphones, and literacy barriers with voice-like, simple flows.",
                "Builds habits: short daily lessons + tiny quizzes → lasting skills.",
                "Offers a helpline & referral path for urgent health or business issues.",
                "Creates a verifiable learning trail for employers and lenders.",
              ].map((item, index) => (
                <motion.li key={index} variants={fadeInUp} className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
          <motion.div
            className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-amber-100"
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <img
              src="https://source.unsplash.com/1200x800/?africa,women,community"
              alt="Women learning together"
              className="w-full h-64 md:h-80 object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection className="max-w-6xl mx-auto px-5 pb-16">
        <motion.div
          className="rounded-3xl bg-gradient-to-r from-rose-500 to-amber-500 text-white p-8 md:p-10 shadow-2xl relative overflow-hidden"
          whileInView="animate"
          initial="initial"
          variants={scaleIn}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-extrabold">Start the journey</h3>
            <p className="mt-2 text-white/90 text-lg">
              Join our pilot and help shape content for your community.
            </p>
            <motion.div className="mt-6 flex gap-4 flex-wrap" variants={staggerContainer}>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl bg-white text-rose-700 font-semibold px-6 py-3 shadow hover:bg-rose-50 transition-colors duration-300"
              >
                Partner with us
              </motion.a>
              <MotionLink
                to="/privacy"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl border border-white/50 px-6 py-3 text-white hover:bg-white/10 transition-colors duration-300"
              >
                Read our Privacy & Consent
              </MotionLink>
            </motion.div>
          </div>
        </motion.div>
      </AnimatedSection>

      {/* Footer */}
      <motion.footer
        className="border-t bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-5 py-6 text-sm text-slate-600 flex flex-wrap items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} Reform Her</div>
          <nav className="flex gap-4">
            <Link to="/privacy" className="hover:text-rose-700 transition-colors duration-300">
              Privacy
            </Link>
            <Link to="/contact" className="hover:text-rose-700 transition-colors duration-300">
              Contact
            </Link>
          </nav>
        </div>
      </motion.footer>
    </main>
  );
}
