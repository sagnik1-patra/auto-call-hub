import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Phone, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";

interface CallLog {
  number: string;
  timestamp: string;
  status: string;
}

const Log = () => {
  const [logs, setLogs] = useState<CallLog[]>([]);

  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem("call_logs") || "[]");
    setLogs(savedLogs);
  }, []);

  const exportToCSV = () => {
    if (logs.length === 0) {
      toast.error("No logs to export");
      return;
    }
    
    const csvContent = [
      ["Number", "Timestamp", "Status"],
      ...logs.map(log => [
        log.number,
        new Date(log.timestamp).toLocaleString(),
        log.status
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "call_log.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Call log exported!");
  };

  const clearLogs = () => {
    localStorage.removeItem("call_logs");
    setLogs([]);
    toast.success("Call log cleared");
  };

  return (
    <>
      <Navbar />
      <div 
        className="min-h-screen p-4 pt-24 relative"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1498050108023-c5249f4df085')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="absolute inset-0 bg-gradient-overlay" />
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <Card className="bg-gradient-card backdrop-blur-xl border-border/50 p-8 animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Call Log</h1>
                  <p className="text-muted-foreground">
                    {logs.length} {logs.length === 1 ? "call" : "calls"} recorded
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={exportToCSV}
                    variant="success"
                    className="gap-2"
                    disabled={logs.length === 0}
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                  
                  <Button 
                    onClick={clearLogs}
                    variant="outline"
                    disabled={logs.length === 0}
                  >
                    Clear Log
                  </Button>
                </div>
              </div>
              
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <Phone className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No calls recorded yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start calling to see logs here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <Card 
                      key={index} 
                      className="p-4 bg-secondary/50 border-border hover:bg-secondary/70 transition-colors"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{log.number}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                          {log.status}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Log;
