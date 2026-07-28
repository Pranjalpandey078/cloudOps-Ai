import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";

export default function AppLayout({ children }) {

    return (

        <div className="relative flex h-screen overflow-hidden">

            <div className="absolute inset-0 overflow-hidden pointer-events-none">

                <div
                    className="
                    absolute
                    -top-60
                    -left-60
                    h-[600px]
                    w-[600px]
                    rounded-full
                    bg-cyan-500/15
                    blur-[180px]
                    animate-pulse
                    "
                />

                <div
                    className="
                    absolute
                    bottom-0
                    right-0
                    h-[700px]
                    w-[700px]
                    rounded-full
                    bg-violet-500/15
                    blur-[220px]
                    animate-pulse
                    "
                />

            </div>

            <div className="relative z-20 flex-shrink-0">\n                <Sidebar />\n            </div>

            <div className="relative z-10 flex-1 flex flex-col">

                <Navbar />

<main className="flex-1 overflow-auto p-10 space-y-8">
                    {children}

                </main>

            </div>

        </div>

    );

}