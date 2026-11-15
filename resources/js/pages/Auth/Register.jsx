
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    UserRound,
    Mail,
    LockKeyhole,
    ArrowRight,
    Trophy,
    ShieldCheck,
    CalendarDays,
    Clock3,
    CheckCircle2,
} from 'lucide-react';

import { register } from '../../services/authService';
import FormInput from '../../components/common/FormInput';

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError('');

        if (form.password !== form.password_confirmation) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            await register(form);

            // Redirect after successful registration.
            // Use /login if your registration API does not
            // automatically authenticate the new user.
            navigate('/login', {
                replace: true,
            });

        } catch (err) {
            console.error(err);

            if (err.response?.data?.errors) {
                setError(
                    Object.values(err.response.data.errors)
                        .flat()
                        .join(' ')
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    'Unable to create your account. Please try again.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        {
            icon: CalendarDays,
            title: 'Easy Court Booking',
            description: 'Reserve your favorite court in just a few clicks.',
        },
        {
            icon: Clock3,
            title: 'Flexible Scheduling',
            description: 'Choose the date and time that works for you.',
        },
        {
            icon: ShieldCheck,
            title: 'Secure Reservations',
            description: 'Manage your bookings through your own account.',
        },
    ];

    return (
        <div className="grid min-h-screen w-full grid-cols-1 bg-[#FFF7F7] font-sans lg:grid-cols-2">

            {/* LEFT BRANDING PANEL */}
            <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-[#260606] via-[#600E0E] to-[#B91C1C] p-12 text-white lg:flex xl:p-16">

                {/* BACKGROUND DECORATIONS */}
                <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full border border-white/10" />

                <div className="pointer-events-none absolute -right-20 top-10 h-[350px] w-[350px] rounded-full border border-red-300/20" />

                <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-400/10 blur-3xl" />

                {/* COURT DECORATION */}
                <div className="pointer-events-none absolute bottom-20 right-[-100px] h-[350px] w-[500px] rotate-[-25deg] rounded-3xl border-2 border-white/10" />

                <div className="pointer-events-none absolute bottom-32 right-10 h-[200px] w-[200px] rounded-full border-2 border-white/10" />

                {/* BRAND LOGO */}
                <Link
                    to="/"
                    className="relative z-10 flex items-center gap-4"
                >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-300/30 bg-white/10 shadow-lg backdrop-blur-sm">
                        <Trophy
                            size={34}
                            strokeWidth={1.8}
                            className="text-red-200"
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-extrabold tracking-wide">
                            COURT
                            <span className="text-red-300">
                                BOOK
                            </span>
                        </h1>

                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-red-100/80">
                            Online Court Reservation
                        </p>
                    </div>
                </Link>

                {/* MAIN CONTENT */}
                <div className="relative z-10 max-w-xl">

                    <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-white/10 px-4 py-2">
                        <span className="h-2 w-2 rounded-full bg-red-300" />

                        <span className="text-xs font-semibold tracking-widest text-red-100">
                            JOIN THE COURTBOOK COMMUNITY
                        </span>
                    </div>

                    <h2 className="text-5xl font-extrabold leading-[1.15] xl:text-6xl">
                        Your Court.
                        <br />
                        Your Time.
                        <br />
                        <span className="text-red-300">
                            Your Game.
                        </span>
                    </h2>

                    <p className="mt-7 max-w-md text-lg leading-relaxed text-red-100/80">
                        Create your account and enjoy a simpler
                        way to discover courts, manage your schedule,
                        and reserve your next game.
                    </p>

                    <div className="mt-10 h-1 w-24 rounded-full bg-red-300" />

                    {/* BENEFITS */}
                    <div className="mt-10 space-y-7">
                        {benefits.map((benefit) => {
                            const Icon = benefit.icon;

                            return (
                                <div
                                    key={benefit.title}
                                    className="flex items-start gap-4"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                                        <Icon
                                            size={23}
                                            className="text-red-200"
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-white">
                                            {benefit.title}
                                        </h3>

                                        <p className="mt-1 text-sm leading-relaxed text-red-100/70">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* LEFT FOOTER */}
                <div className="relative z-10 border-t border-white/20 pt-6">
                    <p className="text-xs text-red-100/80">
                        © {new Date().getFullYear()} CourtBook.
                        All rights reserved.
                    </p>

                    <p className="mt-2 text-xs text-red-200/70">
                        Play More. Wait Less. Book Smarter.
                    </p>
                </div>
            </section>

            {/* RIGHT REGISTRATION PANEL */}
            <section className="flex min-h-screen flex-col bg-[#FFF9F9]">

                {/* MOBILE HEADER */}
                <div className="flex items-center gap-3 border-b border-red-100 p-6 lg:hidden">

                    <Link
                        to="/"
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600"
                    >
                        <Trophy
                            size={25}
                            className="text-white"
                        />
                    </Link>

                    <div>
                        <h1 className="font-extrabold text-[#450A0A]">
                            COURT
                            <span className="text-red-600">
                                BOOK
                            </span>
                        </h1>

                        <p className="text-xs text-slate-500">
                            Online Court Reservation
                        </p>
                    </div>
                </div>

                {/* REGISTRATION CONTAINER */}
                <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10">

                    <div className="w-full max-w-[460px]">

                        {/* WELCOME HEADER */}
                        <div className="mb-8 text-center">

                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                                <UserRound
                                    size={31}
                                    className="text-red-600"
                                />
                            </div>

                            <h2 className="text-3xl font-extrabold tracking-tight text-[#450A0A]">
                                Create Your Account
                            </h2>

                            <p className="mt-3 text-sm text-slate-500">
                                Join CourtBook and start booking your favorite courts.
                            </p>
                        </div>

                        {/* REGISTER CARD */}
                        <div className="rounded-3xl border border-red-100 bg-white p-7 shadow-[0_18px_60px_rgba(127,29,29,0.07)] sm:p-9">

                            <div className="mb-7">
                                <h3 className="text-xl font-bold text-[#450A0A]">
                                    Player Registration
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Fill in your details to get started.
                                </p>
                            </div>

                            {/* REGISTRATION FORM */}
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >

                                {/* FULL NAME */}
                                <FormInput
                                    label="Full Name"
                                    name="name"
                                    type="text"
                                    icon={UserRound}
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    required
                                />

                                {/* EMAIL */}
                                <FormInput
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    icon={Mail}
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email address"
                                    autoComplete="email"
                                    required
                                />

                                {/* PASSWORD */}
                                <FormInput
                                    label="Password"
                                    name="password"
                                    type="password"
                                    icon={LockKeyhole}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Minimum 8 characters"
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />

                                {/* CONFIRM PASSWORD */}
                                <FormInput
                                    label="Confirm Password"
                                    name="password_confirmation"
                                    type="password"
                                    icon={LockKeyhole}
                                    value={form.password_confirmation}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />

                                {/* ERROR MESSAGE */}
                                {error && (
                                    <div
                                        role="alert"
                                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {error}
                                    </div>
                                )}

                                {/* REGISTER BUTTON */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#DC2626] to-[#991B1B] px-5 py-4 font-semibold text-white shadow-lg shadow-red-900/10 transition hover:from-[#B91C1C] hover:to-[#7F1D1D] focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account

                                            <ArrowRight
                                                size={19}
                                                className="transition-transform group-hover:translate-x-1"
                                            />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* LOGIN LINK */}
                            <div className="mt-7 border-t border-red-100 pt-6 text-center">
                                <p className="text-sm text-slate-500">
                                    Already have an account?{' '}

                                    <Link
                                        to="/login"
                                        className="font-semibold text-red-600 transition hover:text-red-700"
                                    >
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* SECURITY NOTE */}
                        <div className="mt-7 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                            <ShieldCheck size={15} />

                            <span>
                                Your account information is securely handled.
                            </span>
                        </div>

                        {/* BACK TO HOME */}
                        <div className="mt-5 text-center">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-red-600"
                            >
                                Back to Home
                                <ArrowRight size={15} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* RIGHT FOOTER */}
                <div className="px-6 pb-7 text-center">

                    <div className="mx-auto mb-4 h-px max-w-[250px] bg-gradient-to-r from-transparent via-red-300/50 to-transparent" />

                    <p className="text-xs text-slate-400">
                        © {new Date().getFullYear()} CourtBook.
                        All rights reserved.
                    </p>
                </div>
            </section>
        </div>
    );
}