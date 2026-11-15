
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, LockKeyhole, ArrowRight, ShieldCheck, CalendarDays, Clock3, Trophy, MapPin } from 'lucide-react';

import { useAuth } from '@context/AuthContext';
import FormInput from '@components/common/FormInput';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setLoading(true);
        setError('');

        try {
            const user = await login(form);
            const role = user?.role?.toLowerCase();

            if (role === 'admin') {
                navigate('/admin/dashboard', {
                    replace: true,
                });
            } else if (role === 'member') {
                navigate('/member/dashboard', {
                    replace: true,
                });
            } else {
                setError('Your account role is not recognized.');
            }
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
                    'Unable to sign in. Please check your credentials.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid min-h-screen w-full grid-cols-1 bg-[#FFF7F7] font-sans lg:grid-cols-2">

            {/* LEFT SIDE - BRANDING */}
            <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-[#450A0A] via-[#7F1D1D] to-[#DC2626] p-12 text-white lg:flex xl:p-16">

                {/* Background decorations */}
                <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full border border-white/10" />

                <div className="pointer-events-none absolute -right-20 top-10 h-[350px] w-[350px] rounded-full border border-red-300/20" />

                <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-300/10 blur-3xl" />

                {/* Court line decorations */}
                <div className="pointer-events-none absolute bottom-20 right-[-100px] h-[350px] w-[500px] rotate-[-25deg] rounded-3xl border-2 border-white/10" />

                <div className="pointer-events-none absolute bottom-32 right-10 h-[200px] w-[200px] rounded-full border-2 border-white/10" />

                {/* LOGO */}
                <div className="relative z-10 flex items-center gap-4">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-300/30 bg-white/10 shadow-lg backdrop-blur-sm">
                        <Trophy
                            size={34}
                            strokeWidth={1.8}
                            className="text-red-300"
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-extrabold tracking-wide">
                            COURT<span className="text-red-300">BOOK</span>
                        </h1>

                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                            Online Court Reservation
                        </p>
                    </div>
                </div>

                {/* HERO CONTENT */}
                <div className="relative z-10 max-w-xl">

                    <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-red-300/10 px-4 py-2">

                        <span className="h-2 w-2 animate-pulse rounded-full bg-red-300" />

                        <span className="text-xs font-semibold tracking-widest text-red-200">
                            YOUR GAME STARTS HERE
                        </span>
                    </div>

                    <h2 className="text-5xl font-extrabold leading-[1.15] xl:text-6xl">
                        Book Your Court.
                        <br />

                        <span className="text-red-300">
                            Own Your Game.
                        </span>
                    </h2>

                    <p className="mt-7 max-w-md text-lg leading-relaxed text-slate-300">
                        Find available sports courts, reserve your
                        preferred time slot, and enjoy a seamless
                        booking experience — all in one place.
                    </p>

                    <div className="mt-10 h-1 w-24 rounded-full bg-red-300" />

                    {/* FEATURES */}
                    <div className="mt-10 grid grid-cols-2 gap-5">

                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                                <CalendarDays
                                    size={22}
                                    className="text-red-300"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold">
                                    Easy Booking
                                </p>
                                <p className="text-xs text-slate-400">
                                    Reserve in seconds
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                                <Clock3
                                    size={22}
                                    className="text-red-300"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold">
                                    Flexible Schedule
                                </p>
                                <p className="text-xs text-slate-400">
                                    Choose your time
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                                <MapPin
                                    size={22}
                                    className="text-red-300"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold">
                                    Court Selection
                                </p>
                                <p className="text-xs text-slate-400">
                                    Find your court
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                                <ShieldCheck
                                    size={22}
                                    className="text-red-300"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold">
                                    Secure Account
                                </p>
                                <p className="text-xs text-slate-400">
                                    Protected access
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="relative z-10 border-t border-white/20 pt-6">

                    <p className="text-xs text-slate-300">
                        © {new Date().getFullYear()} CourtBook.
                        All rights reserved.
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                        Play More. Wait Less. Book Smarter.
                    </p>
                </div>
            </section>

            {/* RIGHT SIDE - LOGIN */}
            <section className="flex min-h-screen flex-col bg-[#FFF9F9]">

                {/* MOBILE HEADER */}
                <div className="flex items-center gap-3 border-b border-slate-200 p-6 lg:hidden">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7F1D1D]">
                        <Trophy
                            size={25}
                            className="text-red-300"
                        />
                    </div>

                    <div>
                        <h1 className="font-extrabold text-[#7F1D1D]">
                            COURTBOOK
                        </h1>

                        <p className="text-xs text-slate-500">
                            Online Court Reservation
                        </p>
                    </div>
                </div>

                {/* LOGIN CONTAINER */}
                <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10">

                    <div className="w-full max-w-[430px]">

                        {/* WELCOME */}
                        <div className="mb-9 text-center">

                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">

                                <Trophy
                                    size={32}
                                    className="text-red-600"
                                />
                            </div>

                            <h2 className="text-3xl font-extrabold tracking-tight text-[#7F1D1D]">
                                Welcome Back!
                            </h2>

                            <p className="mt-3 text-sm text-slate-500">
                                Sign in to manage your court reservations
                            </p>
                        </div>

                        {/* LOGIN CARD */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,35,55,0.07)] sm:p-9">

                            <div className="mb-7">
                                <h3 className="text-xl font-bold text-[#7F1D1D]">
                                    Sign In
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Enter your account details to continue
                                </p>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >

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

                                <FormInput
                                    label="Password"
                                    name="password"
                                    type="password"
                                    icon={LockKeyhole}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
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

                                {/* LOGIN BUTTON */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#DC2626] to-[#B91C1C] px-5 py-4 font-semibold text-white shadow-lg shadow-red-900/10 transition hover:from-[#991B1B] hover:to-[#B91C1C] focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {loading ? (
                                        <>
                                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Signing In...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight
                                                size={19}
                                                className="transition-transform group-hover:translate-x-1"
                                            />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* REGISTER LINK */}
                            <div className="mt-7 border-t border-slate-100 pt-6 text-center">

                                <p className="text-sm text-slate-500">
                                    New to CourtBook?{' '}

                                    <Link
                                        to="/register"
                                        className="font-semibold text-red-600 transition hover:text-red-700"
                                    >
                                        Create an Account
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* SECURITY NOTE */}
                        <div className="mt-7 flex items-center justify-center gap-2 text-center text-xs text-slate-400">

                            <ShieldCheck size={15} />

                            <span>
                                Secure access to your reservations
                            </span>
                        </div>
                    </div>
                </div>

                {/* BOTTOM FOOTER */}
                <div className="px-6 pb-7 text-center">

                    <div className="mx-auto mb-4 h-px max-w-[250px] bg-gradient-to-r from-transparent via-red-200/50 to-transparent" />

                    <p className="text-xs text-slate-400">
                        © {new Date().getFullYear()} CourtBook.
                        All rights reserved.
                    </p>
                </div>
            </section>
        </div>
    );
}