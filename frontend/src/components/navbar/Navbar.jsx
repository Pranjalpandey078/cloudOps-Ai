import {
    FiBell,
    FiSearch
} from "react-icons/fi";

export default function Navbar() {

    return (

        <header className="h-20 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-8">

            <div className="flex items-center gap-4">

                <FiSearch className="text-xl text-slate-400"/>

                <input

                    placeholder="Search servers, incidents..."

                    className="bg-transparent outline-none text-white w-96"

                />

            </div>

            <div className="flex items-center gap-8">

                <FiBell className="text-2xl cursor-pointer"/>

                <div>

                    <p className="font-semibold">

                        Pranjal Pandey

                    </p>

                    <p className="text-xs text-slate-400">

                        Cloud Administrator

                    </p>

                </div>

            </div>

        </header>

    );

}