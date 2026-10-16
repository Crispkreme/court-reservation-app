import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="border-b bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Online Court Reservation
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-6 py-16">
                    <div className="grid w-full items-center gap-12 lg:grid-cols-2">
                        {/* Left Content */}
                        <div>
                            <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                                Court Reservation System
                            </span>

                            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                                Reserve Your Court
                                <span className="block text-blue-600">
                                    Anytime, Anywhere.
                                </span>
                            </h2>

                            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
                                Easily find available courts, choose your preferred
                                schedule, and make your reservation online.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link
                                    to="/login"
                                    className="rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    Create an Account
                                </Link>
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="relative">
                            <div className="rounded-3xl bg-blue-600 p-8 shadow-xl">
                                <div className="rounded-2xl bg-white p-8">
                                    <div className="mb-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Available Courts
                                            </p>

                                            <h3 className="mt-1 text-2xl font-bold text-gray-900">
                                                5 Courts
                                            </h3>
                                        </div>

                                        <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                            Available
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="rounded-xl border border-gray-200 p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        Basketball Court 1
                                                    </h4>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Available for booking
                                                    </p>
                                                </div>

                                                <span className="text-sm font-medium text-green-600">
                                                    Available
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-gray-200 p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        Tennis Court 1
                                                    </h4>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Available for booking
                                                    </p>
                                                </div>

                                                <span className="text-sm font-medium text-green-600">
                                                    Available
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-gray-200 p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        Basketball Court 2
                                                    </h4>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Available for booking
                                                    </p>
                                                </div>

                                                <span className="text-sm font-medium text-green-600">
                                                    Available
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}