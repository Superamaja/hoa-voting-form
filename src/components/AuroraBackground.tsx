/** Decorative gradient field behind every panel. */
export const AuroraBackground = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 overflow-hidden"
  >
    <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,#151d3d_0%,#070b18_55%,#04060f_100%)]" />
    <div className="absolute top-[-10%] -left-24 h-[38rem] w-[38rem] animate-drift rounded-full bg-brand-500/25 blur-[130px]" />
    <div className="absolute -right-32 bottom-[-15%] h-[34rem] w-[34rem] animate-drift rounded-full bg-violet-500/20 blur-[130px] [animation-delay:-7s]" />
    <div className="absolute inset-0 [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px] opacity-[0.035]" />
  </div>
);
