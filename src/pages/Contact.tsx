import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 240 240" fill="currentColor">
    <path d="M66.964 134.874s-32.08-10.062-51.344-16.002c-17.542-6.693-1.57-14.928 6.015-17.59 7.585-2.66 186.2-71.948 186.2-71.948s21.591-9.01 19.924 11.588c-.558 8.235-5.026 37.07-9.494 68.63l-13.4 93.05s-1.115 13.152-10.608 15.37c-9.494 2.218-25.148-7.677-27.924-10.34-2.218-2.104-41.574-26.707-55.532-38.848-3.884-3.326-8.352-9.94.558-17.618 20.033-18.452 43.96-41.286 58.476-55.78 6.694-6.694 13.388-22.398-14.503-3.326-39.96 27.265-79.36 53.413-79.36 53.413s-9.494 5.584-27.265.558" />
  </svg>
);

const GmailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 256 193" fill="none">
    <path d="M58.182 192.05V93.14L27.507 65.077 0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455h40.727z" fill="#4285F4"/>
    <path d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 18.862-27.026 24.78v98.904z" fill="#34A853"/>
    <path d="M58.182 93.14l-4.174-32.592L58.182 28.86 128 80.505l69.818-51.645 4.67 30.264-4.67 34.015L128 144.87 58.182 93.14z" fill="#EA4335"/>
    <path d="M197.818 28.86V93.14L256 49.504V31.405c0-21.585-24.64-33.89-41.89-20.945L197.818 28.86z" fill="#FBBC04"/>
    <path d="M0 49.504l26.759 20.07L58.182 93.14V28.86L41.89 10.46C24.61-2.486 0 9.82 0 31.405v18.1z" fill="#C5221F"/>
  </svg>
);

const contacts = [
  { icon: GmailIcon, label: "Email", tag: "Preferred", value: "roshw0023@gmail.com", href: "mailto:roshw0023@gmail.com", gradient: "from-red-500 to-orange-500" },
  { icon: DiscordIcon, label: "Discord", tag: "Fastest", value: "ehtan_haq", href: undefined, gradient: "from-indigo-500 to-purple-500" },
  { icon: TelegramIcon, label: "Telegram", tag: "Secure", value: "C0deBr34ker1", href: "https://t.me/C0deBr34ker1", gradient: "from-sky-400 to-blue-500" },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim() || null,
      message: form.message.trim(),
    });
    setLoading(false);

    if (error) {
      toast.error("Failed to send message. Please try again.");
      return;
    }
    toast.success("Message sent! I'll get back to you soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="pt-[var(--nav-height)]">
      <section className="container mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
          <p className="mb-3 font-mono text-sm text-primary">Get In Touch</p>
          <h1 className="mb-4 text-4xl font-extrabold text-foreground md:text-5xl">Contact Me</h1>
          <p className="mb-12 text-lg text-muted-foreground">
            Have a project in mind or just want to connect? Send me a message or reach out through any channel below.
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <h2 className="mb-6 text-xl font-bold text-foreground">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What's this about?" />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell me about your project or idea..." rows={6} required />
              </div>
              <Button type="submit" size="lg" className="w-full group" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>

          {/* Contact Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <h2 className="mb-6 text-xl font-bold text-foreground">Other Channels</h2>
            <div className="space-y-4">
              {contacts.map((contact, i) => {
                const Wrapper = contact.href ? "a" : "div";
                const wrapperProps = contact.href ? { href: contact.href, target: "_blank", rel: "noopener noreferrer" } : {};

                return (
                  <motion.div key={contact.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}>
                    <Wrapper {...(wrapperProps as any)}
                      className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${contact.gradient} shadow-lg`}>
                        <contact.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground">{contact.label}</h3>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{contact.tag}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.value}</p>
                      </div>
                    </Wrapper>
                  </motion.div>
                );
              })}
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="mt-8 text-sm text-muted-foreground">
              I typically respond within <strong className="text-foreground">24 hours</strong>. For urgent inquiries, Discord is the fastest way to reach me.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
