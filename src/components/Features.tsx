import { Card } from "@/components/ui/card";
import { Zap, Shield, Globe, Code2, Rocket, Sparkles } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance that delivers results in milliseconds, not seconds."
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description: "Enterprise-grade security built into every layer of our infrastructure."
  },
  {
    icon: Globe,
    title: "Global Scale",
    description: "Deploy worldwide with CDN edge locations across 200+ countries."
  },
  {
    icon: Code2,
    title: "Developer First",
    description: "Clean APIs and comprehensive documentation make integration effortless."
  },
  {
    icon: Rocket,
    title: "Ship Faster",
    description: "From idea to production in minutes with our streamlined workflow."
  },
  {
    icon: Sparkles,
    title: "AI Powered",
    description: "Leverage cutting-edge AI to automate and optimize your workflow."
  }
];

const Features = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful features designed to help you build better, faster, and smarter.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-card hover:-translate-y-1 animate-fade-in-up group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors group-hover:shadow-glow">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
    </section>
  );
};

export default Features;
