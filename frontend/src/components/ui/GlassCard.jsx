export default function GlassCard({
    children,
    className = ""
}) {

    return (

        <div
            className={`
                rounded-3xl
                border
                border-white/10
                bg-white/5
                backdrop-blur-3xl
                shadow-[0_0_40px_rgba(0,255,255,0.08)]
                transition-all
                duration-500
                hover:bg-white/10
                hover:border-cyan-400/40
                hover:shadow-[0_0_60px_rgba(0,255,255,0.25)]
                ${className}
            `}
        >

            {children}

        </div>

    );

}