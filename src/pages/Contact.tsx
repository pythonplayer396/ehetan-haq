import { motion } from "framer-motion";
import { Mail, MessageCircle, Send } from "lucide-react";

const contacts = [
  {
    icon: Mail,
    label: "Email",
    tag: "Preferred",
    value: "roshw0023@gmail.com",
    href: "mailto:roshw0023@gmail.com",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: MessageCircle,
    label: "Discord",
    tag: "Fastest",
    value: "ehtan_haq",
    href: undefined,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Send,
    label: "Telegram",
    tag: "Secure",
    value: "C0deBr34ker1",
    href: "https://t.me/C0deBr34ker1",
    gradient: "from-sky-500 to-blue-600",
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
