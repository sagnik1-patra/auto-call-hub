import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 -left-40 w-96 h-96 bg-primary/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-scale-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Introducing the future of web</span>
          </div>
          
          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Build something
            <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">
              extraordinary
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into reality with our cutting-edge platform. 
            Fast, beautiful, and built for the modern web.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button variant="hero" size="lg" className="gap-2 text-base">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="hero-outline" size="lg" className="text-base">
              Learn More
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">150k+</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">4.9★</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
