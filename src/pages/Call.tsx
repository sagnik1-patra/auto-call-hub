import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Phone, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";

const Call = () => {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [isCalling, setIsCalling] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const savedNumbers = localStorage.getItem("phone_numbers");
    const savedFileName = localStorage.getItem("file_name");
    
    if (!savedNumbers) {
      toast.error("Please complete setup first");
      navigate("/setup");
      return;
    }
    
    setPhoneNumbers(JSON.parse(savedNumbers));
    setFileName(savedFileName || "contacts.xlsx");
  }, [navigate]);

  const makeCall = async (phoneNumber: string) => {
    return new Promise<void>((resolve) => {
      // Request permission and initiate call
      const callUrl = `tel:${phoneNumber}`;
      window.location.href = callUrl;
      
      // Log the call
      const logs = JSON.parse(localStorage.getItem("call_logs") || "[]");
      logs.push({
        number: phoneNumber,
        timestamp: new Date().toISOString(),
        status: "initiated"
      });
      localStorage.setItem("call_logs", JSON.stringify(logs));
      
      toast.success(`Calling ${phoneNumber}...`);
      
      // Wait 10 seconds before next call (simulating call duration)
      setTimeout(resolve, 10000);
    });
  };

  const startCalling = async () => {
    if (phoneNumbers.length === 0) {
      toast.error("No phone numbers to call");
      return;
    }

    setIsCalling(true);
    
    for (let i = 0; i < phoneNumbers.length; i++) {
      setCurrentIndex(i);
      await makeCall(phoneNumbers[i]);
    }
    
    setIsCalling(false);
    toast.success("All calls completed!", {
      description: "View the call log for details",
    });
    setTimeout(() => navigate("/log"), 1500);
  };

  return (
    <>
      <Navbar />
      <div 
        className="min-h-screen flex items-center justify-center p-4 pt-24 relative"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="absolute inset-0 bg-gradient-overlay" />
        
        <Card className="w-full max-w-2xl relative z-10 bg-gradient-card backdrop-blur-xl border-border/50 p-8 animate-fade-in">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold text-foreground">Call Launcher</h1>
              <p className="text-muted-foreground">Review your configuration and start calling</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-secondary/50 border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Loaded File</h3>
                </div>
                <p className="text-sm text-muted-foreground">{fileName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {phoneNumbers.length} phone numbers ready to call
                </p>
              </div>
              
              {isCalling && (
                <div className="bg-primary/10 border border-primary rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground">
                    Calling: {currentIndex + 1} of {phoneNumbers.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {phoneNumbers[currentIndex]}
                  </p>
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={startCalling} 
                disabled={isCalling || phoneNumbers.length === 0}
                className="w-full gap-2"
                variant="success"
                size="lg"
              >
                <Phone className="w-5 h-5" />
                {isCalling ? "Calling..." : `Start Calling (${phoneNumbers.length} numbers)`}
              </Button>
            </div>
            
            <div className="bg-secondary/50 border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2 text-foreground">📱 Mobile App Features:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Automatic sequential calling</li>
                <li>✓ Upload Excel files directly from your device</li>
                <li>✓ Automatic call logging</li>
                <li>✓ 10-second delay between calls</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Call;
