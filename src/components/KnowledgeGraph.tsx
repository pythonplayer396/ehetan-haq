import { useState, useRef, useEffect, useCallback } from "react";

interface GraphNode {
  id: string;
  label: string;
  group: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

const GROUPS: Record<string, string> = {
  core: "hsl(221, 83%, 53%)",
  frontend: "hsl(262, 83%, 58%)",
  backend: "hsl(142, 71%, 45%)",
  bots: "hsl(346, 77%, 50%)",
  tools: "hsl(38, 92%, 50%)",
  services: "hsl(188, 78%, 41%)",
};

const initialNodes: Omit<GraphNode, "x" | "y" | "vx" | "vy">[] = [
  // Core
  { id: "system", label: "System", group: "core", radius: 28 },
  // Frontend
  { id: "react", label: "React", group: "frontend", radius: 22 },
  { id: "tailwind", label: "Tailwind", group: "frontend", radius: 20 },
  { id: "html-css", label: "HTML/CSS", group: "frontend", radius: 18 },
  { id: "ui-design", label: "UI Design", group: "frontend", radius: 16 },
  // Backend
  { id: "nodejs", label: "Node.js", group: "backend", radius: 22 },
  { id: "express", label: "Express", group: "backend", radius: 20 },
  { id: "python", label: "Python", group: "backend", radius: 22 },
  { id: "database", label: "Database", group: "backend", radius: 18 },
  { id: "api", label: "REST API", group: "backend", radius: 18 },
  // Bots
  { id: "discordjs", label: "Discord.js", group: "bots", radius: 22 },
  { id: "discord-bot", label: "Discord Bot", group: "bots", radius: 20 },
  { id: "telegram-bot", label: "Telegram Bot", group: "bots", radius: 20 },
  { id: "chatbot-ai", label: "AI Chatbot", group: "bots", radius: 18 },
  { id: "moderation", label: "Moderation", group: "bots", radius: 16 },
  // Tools
  { id: "linux", label: "Linux/VPS", group: "tools", radius: 20 },
  { id: "bash", label: "Bash", group: "tools", radius: 18 },
  { id: "npm", label: "npm", group: "tools", radius: 16 },
  { id: "ssh", label: "SSH", group: "tools", radius: 16 },
  { id: "security", label: "Security", group: "tools", radius: 18 },
  // Services
  { id: "youtube-api", label: "YouTube API", group: "services", radius: 16 },
  { id: "spotify-api", label: "Spotify API", group: "services", radius: 16 },
  { id: "marketing", label: "Marketing", group: "services", radius: 18 },
  { id: "ecommerce", label: "E-commerce", group: "services", radius: 18 },
];

const edges: GraphEdge[] = [
  // System connects to main hubs
  { source: "system", target: "react" },
  { source: "system", target: "nodejs" },
  { source: "system", target: "python" },
  { source: "system", target: "discordjs" },
  { source: "system", target: "linux" },
  { source: "system", target: "marketing" },
  // Frontend connections
  { source: "react", target: "tailwind" },
  { source: "react", target: "html-css" },
  { source: "react", target: "ui-design" },
  { source: "react", target: "api" },
  { source: "react", target: "ecommerce" },
  { source: "tailwind", target: "html-css" },
  { source: "tailwind", target: "ui-design" },
  // Backend connections
  { source: "nodejs", target: "express" },
  { source: "nodejs", target: "database" },
  { source: "nodejs", target: "api" },
  { source: "nodejs", target: "npm" },
  { source: "nodejs", target: "discordjs" },
  { source: "express", target: "api" },
  { source: "express", target: "database" },
  { source: "python", target: "security" },
  { source: "python", target: "bash" },
  { source: "python", target: "api" },
  { source: "database", target: "api" },
  // Bot connections
  { source: "discordjs", target: "discord-bot" },
  { source: "discord-bot", target: "moderation" },
  { source: "discord-bot", target: "chatbot-ai" },
  { source: "discord-bot", target: "youtube-api" },
  { source: "discord-bot", target: "spotify-api" },
  { source: "telegram-bot", target: "chatbot-ai" },
  { source: "telegram-bot", target: "nodejs" },
  { source: "chatbot-ai", target: "api" },
  // Tools connections
  { source: "linux", target: "bash" },
  { source: "linux", target: "ssh" },
  { source: "linux", target: "security" },
  { source: "bash", target: "ssh" },
  { source: "security", target: "linux" },
  { source: "npm", target: "nodejs" },
  // Services
  { source: "youtube-api", target: "api" },
  { source: "spotify-api", target: "api" },
  { source: "marketing", target: "ecommerce" },
  { source: "ecommerce", target: "react" },
  { source: "ecommerce", target: "database" },
];

function getConnected(nodeId: string): Set<string> {
  const connected = new Set<string>();
  connected.add(nodeId);
  edges.forEach((e) => {
    if (e.source === nodeId) connected.add(e.target);
    if (e.target === nodeId) connected.add(e.source);
  });
  return connected;
}

const KnowledgeGraph = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ w: 700, h: 500 });
  const animRef = useRef<number>(0);
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Initialize nodes with positions
  useEffect(() => {
    const cx = dimensions.w / 2;
    const cy = dimensions.h / 2;
    nodesRef.current = initialNodes.map((n, i) => {
      const angle = (i / initialNodes.length) * Math.PI * 2;
      const dist = n.group === "core" ? 0 : 100 + Math.random() * 120;
      return {
        ...n,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
      };
    });
  }, [dimensions]);

  // Resize
  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ w: rect.width, h: Math.max(450, Math.min(rect.width * 0.7, 600)) });
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Physics + render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.w * dpr;
    canvas.height = dimensions.h * dpr;
    ctx.scale(dpr, dpr);

    const nodeMap = new Map<string, GraphNode>();

    const tick = () => {
      const nodes = nodesRef.current;
      nodeMap.clear();
      nodes.forEach((n) => nodeMap.set(n.id, n));

      // Force simulation
      const cx = dimensions.w / 2;
      const cy = dimensions.h / 2;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (dragRef.current?.id === n.id) continue;

        // Center gravity
        n.vx += (cx - n.x) * 0.0005;
        n.vy += (cy - n.y) * 0.0005;

        // Repulsion
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          let dx = n.x - m.x;
          let dy = n.y - m.y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = n.radius + m.radius + 30;
          if (dist < minDist) {
            const force = (minDist - dist) / dist * 0.05;
            n.vx += dx * force;
            n.vy += dy * force;
            if (dragRef.current?.id !== m.id) {
              m.vx -= dx * force;
              m.vy -= dy * force;
            }
          }
        }
      }

      // Spring force for edges
      edges.forEach((e) => {
        const a = nodeMap.get(e.source);
        const b = nodeMap.get(e.target);
        if (!a || !b) return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const target = 100;
        const force = (dist - target) / dist * 0.003;
        if (dragRef.current?.id !== a.id) {
          a.vx += dx * force;
          a.vy += dy * force;
        }
        if (dragRef.current?.id !== b.id) {
          b.vx -= dx * force;
          b.vy -= dy * force;
        }
      });

      // Apply velocity
      nodes.forEach((n) => {
        if (dragRef.current?.id === n.id) return;
        n.vx *= 0.9;
        n.vy *= 0.9;
        n.x += n.vx;
        n.y += n.vy;
        // Bounds
        n.x = Math.max(n.radius, Math.min(dimensions.w - n.radius, n.x));
        n.y = Math.max(n.radius, Math.min(dimensions.h - n.radius, n.y));
      });

      // Render
      ctx.clearRect(0, 0, dimensions.w, dimensions.h);

      const activeId = selected || hovered;
      const connectedSet = activeId ? getConnected(activeId) : null;

      // Draw edges
      edges.forEach((e) => {
        const a = nodeMap.get(e.source);
        const b = nodeMap.get(e.target);
        if (!a || !b) return;

        const isHighlighted = connectedSet && connectedSet.has(e.source) && connectedSet.has(e.target);
        const isDimmed = connectedSet && !isHighlighted;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = isHighlighted
          ? "rgba(96, 165, 250, 0.6)"
          : isDimmed
            ? "rgba(100, 116, 139, 0.08)"
            : "rgba(100, 116, 139, 0.2)";
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((n) => {
        const isActive = activeId === n.id;
        const isConnected = connectedSet?.has(n.id);
        const isDimmed = connectedSet && !isConnected;
        const color = GROUPS[n.group] || "hsl(220, 10%, 50%)";

        ctx.globalAlpha = isDimmed ? 0.15 : 1;

        // Glow for active
        if (isActive) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 8, 0, Math.PI * 2);
          const glow = ctx.createRadialGradient(n.x, n.y, n.radius, n.x, n.y, n.radius + 8);
          glow.addColorStop(0, color.replace(")", ", 0.3)").replace("hsl", "hsla"));
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? color : color.replace(")", ", 0.85)").replace("hsl", "hsla");
        ctx.fill();

        // Border
        ctx.strokeStyle = isActive
          ? "rgba(255,255,255,0.8)"
          : isConnected
            ? "rgba(255,255,255,0.4)"
            : "rgba(255,255,255,0.15)";
        ctx.lineWidth = isActive ? 2.5 : 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = isDimmed ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.95)";
        ctx.font = `${isActive ? "bold " : ""}${n.radius > 20 ? 11 : 9}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(n.label, n.x, n.y);

        ctx.globalAlpha = 1;
      });

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [dimensions, selected, hovered]);

  const findNode = useCallback(
    (x: number, y: number) => {
      for (let i = nodesRef.current.length - 1; i >= 0; i--) {
        const n = nodesRef.current[i];
        const dx = x - n.x;
        const dy = y - n.y;
        if (dx * dx + dy * dy <= n.radius * n.radius) return n;
      }
      return null;
    },
    []
  );

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handlePointerDown = (e: React.MouseEvent) => {
    const pos = getPos(e);
    const node = findNode(pos.x, pos.y);
    if (node) {
      dragRef.current = { id: node.id, ox: pos.x - node.x, oy: pos.y - node.y };
      setSelected(node.id === selected ? null : node.id);
    } else {
      setSelected(null);
    }
  };

  const handlePointerMove = (e: React.MouseEvent) => {
    const pos = getPos(e);
    mouseRef.current = pos;

    if (dragRef.current) {
      const node = nodesRef.current.find((n) => n.id === dragRef.current!.id);
      if (node) {
        node.x = pos.x - dragRef.current.ox;
        node.y = pos.y - dragRef.current.oy;
        node.vx = 0;
        node.vy = 0;
      }
    } else {
      const node = findNode(pos.x, pos.y);
      setHovered(node?.id || null);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = node ? "pointer" : "default";
      }
    }
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  // Connection info panel
  const activeNode = selected ? nodesRef.current.find((n) => n.id === selected) : null;
  const connectedNodes = selected
    ? edges
        .filter((e) => e.source === selected || e.target === selected)
        .map((e) => (e.source === selected ? e.target : e.source))
        .map((id) => nodesRef.current.find((n) => n.id === id)!)
        .filter(Boolean)
    : [];

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.w, height: dimensions.h }}
        className="rounded-xl border border-border/50 bg-card/50"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
      />

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {Object.entries(GROUPS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs capitalize text-muted-foreground">{key}</span>
          </div>
        ))}
      </div>

      {/* Info panel */}
      {activeNode && (
        <div className="absolute right-3 top-3 w-52 rounded-lg border border-border bg-card/95 p-4 shadow-xl backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: GROUPS[activeNode.group] }}
            />
            <h4 className="text-sm font-bold text-foreground">{activeNode.label}</h4>
          </div>
          <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            {activeNode.group} · {connectedNodes.length} connections
          </p>
          <div className="space-y-1">
            {connectedNodes.map((cn) => (
              <button
                key={cn.id}
                onClick={() => setSelected(cn.id)}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: GROUPS[cn.group] }}
                />
                {cn.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Click a node to explore connections · Drag nodes to rearrange
      </p>
    </div>
  );
};

export default KnowledgeGraph;
