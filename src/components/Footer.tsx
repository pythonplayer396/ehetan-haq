import { Github } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/50 py-8">
    <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Ethan Haq. All rights reserved.
      </p>
      <a
        href="https://github.com/pythonplayer396"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground transition-colors hover:text-primary"
      >
        <Github className="h-5 w-5" />
      </a>
    </div>
  </footer>
);

export default Footer;
