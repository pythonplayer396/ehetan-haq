import { cn } from "@/lib/utils";

const innerItems = [
  { label: "Frontend", color: "hsl(217 91% 60%)" },
  { label: "Backend", color: "hsl(142 71% 45%)" },
  { label: "Database", color: "hsl(38 92% 50%)" },
];

const outerItems = [
  { label: "APIs", color: "hsl(262 83% 58%)" },
  { label: "Bots", color: "hsl(346 77% 50%)" },
  { label: "Services", color: "hsl(188 78% 41%)" },
];

const OrbitSystem = () => {
  return (
    <div className="relative mx-auto h-[340px] w-[340px] sm:h-[420px] sm:w-[420px]">
      {/* Orbit rings */}
      <div className="orbit-ring h-[240px] w-[240px] sm:h-[300px] sm:w-[300px]" />
      <div className="orbit-ring h-[340px] w-[340px] sm:h-[420px] sm:w-[420px]" />

      {/* Center node */}
      <div className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-lg"
        style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
      >
        System
      </div>

      {/* Inner orbit items */}
      {innerItems.map((item, i) => (
        <div
          key={item.label}
          className="orbit-item absolute left-1/2 top-1/2 -ml-6 -mt-6"
          style={{
            "--radius-val": "clamp(120px, 18vw, 150px)",
            "--orbit-duration": "20s",
            animationDelay: `${(i * 20) / 3}s`,
          } as React.CSSProperties}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-[10px] font-semibold text-white shadow-md"
            style={{ backgroundColor: item.color }}
          >
            {item.label}
          </div>
        </div>
      ))}

      {/* Outer orbit items */}
      {outerItems.map((item, i) => (
        <div
          key={item.label}
          className="orbit-item-reverse absolute left-1/2 top-1/2 -ml-5 -mt-5"
          style={{
            "--radius-val": "clamp(170px, 25vw, 210px)",
            "--orbit-duration": "30s",
            animationDelay: `${(i * 30) / 3}s`,
          } as React.CSSProperties}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-[9px] font-semibold text-white shadow-md"
            style={{ backgroundColor: item.color }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrbitSystem;
