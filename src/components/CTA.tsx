import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-2xl bg-gradient-card backdrop-blur-sm border border-primary/20 shadow-card animate-fade-in relative overflow-hidden">
          {/* Animated gradient */}
          <div className="absolute inset-0 bg-gradient-primary opacity-5 animate-pulse" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to get started?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of developers and teams building the future. 
              Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button variant="hero" size="lg" className="gap-2 text-base">
                Start Building
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="hero-outline" size="lg" className="text-base">
                Talk to Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
};

export default CTA;
