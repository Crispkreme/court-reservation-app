
import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    Clock3,
    ShieldCheck,
    Trophy,
    MapPin,
    CheckCircle2,
    Menu,
    X,
    CircleDot,
    Target,
    CircleDotDashed,
    Users,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const sports = [
    {
        name: 'Basketball',
        description: 'Indoor and outdoor basketball courts',
        icon: CircleDotDashed,
        label: 'Team Sports',
    },
    {
        name: 'Badminton',
        description: 'Professional badminton courts',
        icon: Target,
        label: 'Racket Sports',
    },
    {
        name: 'Volleyball',
        description: 'Courts for competitive and casual play',
        icon: Users,
        label: 'Team Sports',
    },
    {
        name: 'Tennis',
        description: 'Quality courts for every skill level',
        icon: Trophy,
        label: 'Racket Sports',
    },
];

const steps = [
    {
        number: '01',
        title: 'Choose Your Court',
        description:
            'Browse available sports courts and find the perfect place for your game.',
        icon: MapPin,
    },
    {
        number: '02',
        title: 'Pick Your Schedule',
        description:
            'Select your preferred date and available time slot.',
        icon: CalendarDays,
    },
    {
        number: '03',
        title: 'Confirm Reservation',
        description:
            'Submit your reservation and get ready to play.',
        icon: CheckCircle2,
    },
];

export default function Index() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">

            {/* NAVIGATION */}
            <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
                <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">

                    <Link to="/" className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/20">
                            <Trophy size={24} strokeWidth={2} />
                        </div>

                        <div>
                            <h1 className="text-xl font-black tracking-tight text-[#450A0A]">
                                COURT<span className="text-red-600">BOOK</span>
                            </h1>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Online Court Reservation
                            </p>
                        </div>
                    </Link>

                    {/* DESKTOP MENU */}
                    <div className="hidden items-center gap-9 lg:flex">
                        <a href="#home" className="text-sm font-semibold text-red-600">
                            Home
                        </a>
                        <a href="#courts" className="text-sm font-medium text-slate-600 transition hover:text-red-600">
                            Courts
                        </a>
                        <a href="#how-it-works" className="text-sm font-medium text-slate-600 transition hover:text-red-600">
                            How It Works
                        </a>
                        <a href="#about" className="text-sm font-medium text-slate-600 transition hover:text-red-600">
                            About
                        </a>
                    </div>

                    <div className="hidden items-center gap-3 lg:flex">
                        <Link
                            to="/login"
                            className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 transition hover:text-red-600"
                        >
                            Sign In
                        </Link>

                        <Link
                            to="/register"
                            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
                        >
                            Get Started
                            <ArrowUpRight size={17} />
                        </Link>
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        className="rounded-lg p-2 text-slate-700 lg:hidden"
                    >
                        {menuOpen ? <X size={25} /> : <Menu size={25} />}
                    </button>
                </nav>

                {/* MOBILE NAVIGATION */}
                {menuOpen && (
                    <div className="border-t border-slate-100 bg-white px-6 py-5 lg:hidden">
                        <div className="flex flex-col gap-4">
                            {[
                                ['Home', '#home'],
                                ['Courts', '#courts'],
                                ['How It Works', '#how-it-works'],
                                ['About', '#about'],
                            ].map(([label, href]) => (
                                <a
                                    key={href}
                                    href={href}
                                    onClick={() => setMenuOpen(false)}
                                    className="text-sm font-semibold text-slate-700 hover:text-red-600"
                                >
                                    {label}
                                </a>
                            ))}

                            <div className="mt-2 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                                <Link
                                    to="/login"
                                    className="rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="rounded-xl bg-red-600 py-3 text-center text-sm font-semibold text-white"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* HERO SECTION */}
            <section
                id="home"
                className="relative overflow-hidden bg-gradient-to-br from-[#260606] via-[#600E0E] to-[#B91C1C] text-white"
            >
                {/* DECORATIONS */}
                <div className="pointer-events-none absolute -right-40 -top-40 h-[550px] w-[550px] rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-10 top-20 h-[350px] w-[350px] rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-red-500/20 blur-3xl" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-28">

                    {/* HERO TEXT */}
                    <div className="relative z-10">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-white/10 px-4 py-2">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-red-300" />
                            <span className="text-xs font-bold uppercase tracking-widest text-red-100">
                                Your Game Starts Here
                            </span>
                        </div>

                        <h2 className="text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl xl:text-7xl">
                            Your Court.
                            <br />
                            Your Time.
                            <br />
                            <span className="text-red-300">
                                Your Game.
                            </span>
                        </h2>

                        <p className="mt-7 max-w-lg text-lg leading-relaxed text-red-100/80">
                            Skip the hassle of booking. Discover sports
                            courts, choose your preferred schedule,
                            and reserve your spot with CourtBook.
                        </p>

                        <div className="mt-9 flex flex-wrap gap-4">
                            <Link
                                to="/register"
                                className="group inline-flex items-center gap-3 rounded-xl bg-white px-7 py-4 font-bold text-red-700 shadow-xl transition hover:bg-red-50"
                            >
                                Book a Court
                                <ArrowRight
                                    size={19}
                                    className="transition group-hover:translate-x-1"
                                />
                            </Link>

                            <a
                                href="#how-it-works"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-4 font-semibold text-white transition hover:bg-white/20"
                            >
                                How It Works
                                <ChevronRight size={18} />
                            </a>
                        </div>

                        <div className="mt-12 flex flex-wrap gap-7 border-t border-white/20 pt-7">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={20} className="text-red-300" />
                                <span className="text-sm text-red-100">
                                    Secure Booking
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock3 size={20} className="text-red-300" />
                                <span className="text-sm text-red-100">
                                    Flexible Scheduling
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* HERO VISUAL */}
                    <div className="relative mx-auto w-full max-w-[500px]">
                        <div className="absolute -inset-6 rounded-[3rem] bg-red-400/10 blur-3xl" />

                        <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-7">

                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-red-200">
                                        CourtBook
                                    </p>
                                    <h3 className="mt-1 text-xl font-bold">
                                        Find Your Next Game
                                    </h3>
                                </div>

                                <div className="rounded-xl bg-white/15 p-3">
                                    <CalendarDays size={24} />
                                </div>
                            </div>

                            {/* COURT ILLUSTRATION */}
                            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#991B1B] to-[#450A0A]">

                                <div className="absolute inset-5 rounded-lg border-[3px] border-white/60">
                                    <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/60" />

                                    <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white/60 sm:h-32 sm:w-32" />

                                    <div className="absolute inset-y-1/4 left-0 w-1/5 border-y-[3px] border-r-[3px] border-white/60" />

                                    <div className="absolute inset-y-1/4 right-0 w-1/5 border-y-[3px] border-l-[3px] border-white/60" />
                                </div>

                                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white/15 shadow-xl backdrop-blur-sm">
                                    <CircleDotDashed size={44} className="text-white" />
                                </div>

                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs font-semibold backdrop-blur-md">
                                    Find • Book • Play
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between rounded-xl bg-white/10 px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-red-400/20 p-2">
                                        <CalendarDays size={20} className="text-red-200" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">
                                            Ready to Play?
                                        </p>
                                        <p className="text-xs text-red-100/70">
                                            Reserve your preferred court
                                        </p>
                                    </div>
                                </div>

                                <ArrowUpRight size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* COURT CATEGORIES */}
            <section id="courts" className="scroll-mt-24 bg-[#FAFAFA] py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

                    <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div>
                            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-600">
                                Explore Sports
                            </span>

                            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#450A0A] sm:text-4xl">
                                Find Your Perfect Court
                            </h2>

                            <p className="mt-4 max-w-xl text-slate-500">
                                Explore different sports and choose the
                                court that suits your next game.
                            </p>
                        </div>

                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 font-bold text-red-600 hover:text-red-700"
                        >
                            Start Booking
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {sports.map((sport) => {
                            const Icon = sport.icon;

                            return (
                                <div
                                    key={sport.name}
                                    className="group rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-red-900/5"
                                >
                                    <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition group-hover:bg-red-600 group-hover:text-white">
                                        <Icon size={30} strokeWidth={1.8} />
                                    </div>

                                    <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                                        {sport.label}
                                    </span>

                                    <h3 className="mt-2 text-xl font-extrabold text-slate-900">
                                        {sport.name}
                                    </h3>

                                    <p className="mt-3 min-h-[48px] text-sm leading-relaxed text-slate-500">
                                        {sport.description}
                                    </p>

                                    <Link
                                        to="/login"
                                        className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-red-600 transition group-hover:gap-3"
                                    >
                                        Explore Courts
                                        <ArrowRight size={17} />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how-it-works" className="scroll-mt-24 bg-white py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

                    <div className="mx-auto mb-14 max-w-2xl text-center">
                        <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-600">
                            Simple & Convenient
                        </span>

                        <h2 className="mt-3 text-3xl font-black text-[#450A0A] sm:text-4xl">
                            Book in 3 Simple Steps
                        </h2>

                        <p className="mt-4 text-slate-500">
                            Less time planning, more time playing.
                            CourtBook makes reservations simple.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {steps.map((step) => {
                            const Icon = step.icon;

                            return (
                                <div
                                    key={step.number}
                                    className="relative rounded-2xl border border-slate-100 bg-[#FAFAFA] p-8"
                                >
                                    <span className="absolute right-7 top-5 text-6xl font-black text-red-100">
                                        {step.number}
                                    </span>

                                    <div className="relative mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
                                        <Icon size={29} />
                                    </div>

                                    <h3 className="relative text-xl font-extrabold text-slate-900">
                                        {step.title}
                                    </h3>

                                    <p className="relative mt-4 text-sm leading-7 text-slate-500">
                                        {step.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ABOUT / BENEFITS */}
            <section id="about" className="scroll-mt-24 bg-[#FFF5F5] py-20 lg:py-24">
                <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">

                    <div>
                        <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-600">
                            Why CourtBook?
                        </span>

                        <h2 className="mt-4 text-3xl font-black leading-tight text-[#450A0A] sm:text-4xl">
                            A Better Way to
                            <br />
                            Reserve Your Game.
                        </h2>

                        <p className="mt-6 max-w-lg leading-8 text-slate-600">
                            CourtBook brings court discovery and
                            scheduling into one convenient platform,
                            helping players organize their games
                            without unnecessary hassle.
                        </p>

                        <div className="mt-8 space-y-4">
                            {[
                                'Convenient online court reservations',
                                'Easy date and time slot selection',
                                'Manage your bookings in one place',
                                'Simple and user-friendly experience',
                            ].map((feature) => (
                                <div key={feature} className="flex items-center gap-3">
                                    <CheckCircle2 size={21} className="shrink-0 text-red-600" />
                                    <span className="font-medium text-slate-700">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl bg-gradient-to-br from-red-700 to-[#450A0A] p-8 text-white shadow-2xl shadow-red-900/10 sm:p-12">
                        <div className="mb-8 inline-flex rounded-2xl bg-white/15 p-5">
                            <Trophy size={40} />
                        </div>

                        <h3 className="text-3xl font-black leading-tight">
                            Your Next Game
                            <br />
                            Is Just a Click Away.
                        </h3>

                        <p className="mt-5 leading-relaxed text-red-100">
                            Create your account and start planning
                            your next sports session with CourtBook.
                        </p>

                        <Link
                            to="/register"
                            className="mt-9 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-4 font-bold text-red-700 transition hover:bg-red-50"
                        >
                            Create Your Account
                            <ArrowRight size={19} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="bg-[#450A0A] py-20 text-center text-white">
                <div className="mx-auto max-w-3xl px-5">
                    <h2 className="text-3xl font-black sm:text-5xl">
                        Ready to Hit the Court?
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl text-red-100/80">
                        Join CourtBook and make your next court
                        reservation easier than ever.
                    </p>

                    <Link
                        to="/register"
                        className="mt-8 inline-flex items-center gap-3 rounded-xl bg-red-600 px-8 py-4 font-bold text-white transition hover:bg-red-500"
                    >
                        Get Started Today
                        <ArrowRight size={19} />
                    </Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-[#1C0808] py-10 text-white">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 text-center sm:px-8 md:flex-row md:text-left lg:px-12">

                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
                            <Trophy size={22} />
                        </div>

                        <div>
                            <p className="font-black tracking-wide">
                                COURT<span className="text-red-400">BOOK</span>
                            </p>
                            <p className="text-xs text-slate-400">
                                Online Court Reservation
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400">
                        © {new Date().getFullYear()} CourtBook.
                        All rights reserved.
                    </p>

                    <div className="flex items-center gap-5 text-sm text-slate-400">
                        <a href="#home" className="hover:text-white">
                            Home
                        </a>
                        <a href="#courts" className="hover:text-white">
                            Courts
                        </a>
                        <Link to="/login" className="hover:text-white">
                            Login
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
