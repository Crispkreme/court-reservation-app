
export default function Footer() {
    return (
        <footer className="w-full flex-none border-t border-red-100 bg-white px-5 py-4 sm:px-8">
            <div className="flex w-full flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">

                {/* Copyright */}
                <p className="text-xs leading-relaxed text-gray-500">
                    © {new Date().getFullYear()}{" "}
                    <span className="font-semibold text-red-800">
                        CourtBook
                    </span>
                    . All rights reserved.
                </p>

                {/* System Description */}
                <p className="text-xs font-medium text-gray-500">
                    Online Court Reservation System
                </p>

            </div>
        </footer>
    );
}
