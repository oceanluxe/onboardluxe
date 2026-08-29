import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, FileUp } from "lucide-react";
import { Link } from "wouter";
import luxeLogo from "@assets/luxe-logo.jpg";

function parseApiErrorPayload(error: unknown): { status?: number; message?: string; actionHint?: string } | null {
  const raw = error && typeof error === "object" && "message" in error ? (error as any).message : null;
  if (typeof raw !== "string") return null;
  const match = raw.match(/^(\d{3})\s*:\s*([\s\S]*)$/);
  const status = match ? Number(match[1]) : undefined;
  const body = match ? match[2] : raw;
  const trimmed = body.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return { status, message: trimmed };
  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object") return { status, message: trimmed };
    return {
      status,
      message: typeof (parsed as any).message === "string" ? (parsed as any).message : undefined,
      actionHint: typeof (parsed as any).actionHint === "string" ? (parsed as any).actionHint : undefined,
    };
  } catch {
    return { status, message: trimmed };
  }
}

const OceanLuxeLogo = () => (
  <div className="flex items-center gap-2.5" aria-label="Ocean Luxe Estate LLC">
    <img src={luxeLogo} alt="Ocean Luxe shell logo" className="h-8 w-8 rounded-md object-cover" />
    <div className="flex flex-col leading-none gap-0.5">
      <span className="text-sm font-semibold tracking-widest text-white" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.12em" }}>
        OCEAN LUXE
      </span>
      <span className="text-[8px] tracking-[0.22em] uppercase" style={{ color: "hsl(43,85%,52%)" }}>
        Estate LLC
      </span>
    </div>
  </div>
);

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const initialPosition = new URLSearchParams(window.location.search).get("position") || "Acquisitions Agent";
  const [form, setForm] = useState({ name: "", phone: "", email: "", position: initialPosition, experience: "", whyOceanLuxe: "", resumeName: "", interviewAnswers: ["", "", ""] });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("POST", "/api/agents", { name: data.name, phone: data.phone });
      return res.json();
    },
    onSuccess: (agent) => {
      toast({ title: "Welcome to Ocean Luxe!", description: "Your agent profile has been created." });
      navigate("/agent");
    },
    onError: (e: any) => {
      const payload = parseApiErrorPayload(e);
      const title = payload?.status === 403 ? "Signup restricted" : "Error";
      const description = payload?.actionHint || payload?.message || e.message || "Request failed.";
      toast({ title, description, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast({ title: "Missing details", description: "Please enter your full name and phone number.", variant: "destructive" });
      return;
    }
    mutate(form);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="ol-gradient ol-gold-line px-6 py-4 flex items-center gap-4">
        <Link href="/">
          <button className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <OceanLuxeLogo />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src={luxeLogo}
              alt="Ocean Luxe"
              className="h-16 w-16 rounded-xl object-cover mx-auto mb-5"
              style={{ boxShadow: "0 0 30px rgba(212,168,45,0.2)" }}
            />
            <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Apply to Ocean Luxe</h1>
            <p className="text-muted-foreground text-sm mt-1.5 tracking-wide">Tell us a little about yourself — onboarding comes next.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="tracking-wide text-xs uppercase text-muted-foreground">Full Legal Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                data-testid="input-name"
                placeholder="e.g. Giovanna Davis"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="tracking-wide text-xs uppercase text-muted-foreground">Email Address</Label>
              <Input id="email" type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="position" className="tracking-wide text-xs uppercase text-muted-foreground">Position of Interest</Label>
              <select id="position" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Virtual Assistant</option><option>Acquisitions Agent</option><option>Senior Acquisitions Agent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resume" className="tracking-wide text-xs uppercase text-muted-foreground">Resume</Label>
              <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={e => setForm(f => ({ ...f, resumeName: e.target.files?.[0]?.name || "" }))} />
              <p className="text-xs text-muted-foreground flex items-center gap-1"><FileUp className="h-3 w-3" /> Resume filename will be included with your application.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="experience" className="tracking-wide text-xs uppercase text-muted-foreground">Relevant Experience</Label>
              <Input id="experience" placeholder="Sales, real estate, customer success..." value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="tracking-wide text-xs uppercase text-muted-foreground">Interview Questions</Label>
              {["Tell us about your experience and the strengths you would bring to this role.", "Describe a time you solved a problem or took initiative.", "Why are you interested in working with Ocean Luxe?"] .map((question, index) => <div key={question} className="space-y-1"><p className="text-xs text-muted-foreground">{question}</p><textarea value={form.interviewAnswers[index]} onChange={e => setForm(f => ({ ...f, interviewAnswers: f.interviewAnswers.map((answer, i) => i === index ? e.target.value : answer) }))} className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>)}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whyOceanLuxe" className="tracking-wide text-xs uppercase text-muted-foreground">Why Ocean Luxe?</Label>
              <textarea id="whyOceanLuxe" placeholder="Tell us what draws you to the team..." value={form.whyOceanLuxe} onChange={e => setForm(f => ({ ...f, whyOceanLuxe: e.target.value }))} className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="tracking-wide text-xs uppercase text-muted-foreground">Phone Number <span className="text-destructive">*</span></Label>
              <Input
                id="phone"
                type="tel"
                data-testid="input-phone"
                placeholder="(555) 000-0000"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                data-testid="btn-register"
                disabled={isPending}
                className="w-full py-3 rounded-md font-semibold tracking-wide transition-all disabled:opacity-50"
                style={{ background: "#0a0a0a", color: "hsl(43,85%,52%)" }}
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Creating profile...</span>
                ) : (
                  "Submit Application & Continue →"
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-1 tracking-wide">
              By continuing, you agree to Ocean Luxe's contractor terms and $50/month platform fee.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
