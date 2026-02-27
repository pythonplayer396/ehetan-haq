import { motion } from "framer-motion";
import { Mail } from "lucide-react";

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const GmailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
  </svg>
);

const contacts = [
  {
    icon: GmailIcon,
    label: "Email",
    tag: "Preferred",
    value: "roshw0023@gmail.com",
    href: "mailto:roshw0023@gmail.com",
    gradient: "from-red-500 to-orange-500",
  },
  {
    icon: DiscordIcon,
    label: "Discord",
    tag: "Fastest",
    value: "ehtan_haq",
    href: undefined,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: TelegramIcon,
    label: "Telegram",
    tag: "Secure",
    value: "C0deBr34ker1",
    href: "https://t.me/C0deBr34ker1",
    gradient: "from-sky-400 to-blue-500",
  },
];

const Contact = () => {
  return (
    <div className="pt-[var(--nav-height)]">
      <section className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <p className="mb-3 font-mono text-sm text-primary">Get In Touch</p>
          <h1 className="mb-4 text-4xl font-extrabold text-foreground md:text-5xl">Contact Me</h1>
          <p className="mb-12 text-lg text-muted-foreground">
            Have a project in mind or just want to connect? Feel free to reach out through any of the channels below. I'm always open to discussing new ideas.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-3">
          {contacts.map((contact, i) => {
            const Wrapper = contact.href ? "a" : "div";
            const wrapperProps = contact.href
              ? { href: contact.href, target: "_blank", rel: "noopener noreferrer" }
              : {};

            return (
              <motion.div
                key={contact.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <Wrapper
                  {...(wrapperProps as any)}
                  className="group block rounded-xl border border-border/50 bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${contact.gradient} shadow-lg`}>
                    <contact.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-foreground">{contact.label}</h3>
                  <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                    {contact.tag}
                  </span>
                  <p className="text-sm text-muted-foreground">{contact.value}</p>
                </Wrapper>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-sm text-muted-foreground"
        >
          I typically respond within <strong className="text-foreground">24 hours</strong>. For urgent inquiries, Discord is the fastest way to reach me.
        </motion.p>
      </section>
    </div>
  );
};

export default Contact;
