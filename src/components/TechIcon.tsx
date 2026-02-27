interface TechIconProps {
  name: string;
  className?: string;
}

const icons: Record<string, string> = {
  JavaScript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  Python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  React: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "Tailwind CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
  "Discord.js": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/discordjs/discordjs-original.svg",
  "Express.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
  "Bash/Linux": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg",
  TypeScript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  HTML: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  CSS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  Linux: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  npm: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg",
  Ubuntu: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-original.svg",
  SSH: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ssh/ssh-original.svg",
};

const TechIcon = ({ name, className = "h-8 w-8" }: TechIconProps) => {
  const src = icons[name];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={name}
      className={className}
      loading="lazy"
    />
  );
};

export default TechIcon;
