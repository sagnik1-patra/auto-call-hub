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
  const [actionType, setActionType] = useState<"call" | "sms" | "whatsapp">("call");

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

  const performAction = async (phoneNumber: string) => {
    return new Promise<void>((resolve) => {
      try {
        const message = "Your Son/daughter did not come to college today";
        let actionUrl = "";
        let status = "";
        
        switch (actionType) {
          case "call":
            actionUrl = `tel:${phoneNumber}`;
            status = "call initiated";
            toast.success(`Calling ${phoneNumber}...`);
            break;
          case "sms":
            actionUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
            status = "sms sent";
            toast.success(`Sending SMS to ${phoneNumber}...`);
            break;
          case "whatsapp":
            actionUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
            status = "whatsapp sent";
            toast.success(`Sending WhatsApp to ${phoneNumber}...`);
            break;
        }
        
        // Use window.open to avoid navigating away from the page
        window.open(actionUrl, '_blank');
        
        // Log the action
        const logs = JSON.parse(localStorage.getItem("call_logs") || "[]");
        logs.push({
          number: phoneNumber,
          timestamp: new Date().toISOString(),
          status: status
        });
        localStorage.setItem("call_logs", JSON.stringify(logs));
      } catch (error) {
        console.error('Error performing action:', error);
        toast.error(`Error processing ${phoneNumber}`);
      }
      
      // Always resolve after 10 seconds to continue to next number
      setTimeout(() => {
        console.log(`Completed action for ${phoneNumber}, moving to next`);
        resolve();
      }, 10000);
    });
  };

  const startAction = async () => {
    if (phoneNumbers.length === 0) {
      toast.error("No phone numbers available");
      return;
    }

    setIsCalling(true);
    
    for (let i = 0; i < phoneNumbers.length; i++) {
      setCurrentIndex(i);
      await performAction(phoneNumbers[i]);
    }
    
    setIsCalling(false);
    const actionText = actionType === "call" ? "calls" : actionType === "sms" ? "messages" : "WhatsApp messages";
    toast.success(`All ${actionText} completed!`, {
      description: "View the log for details",
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
              <h1 className="text-3xl font-bold text-foreground">Communication Launcher</h1>
              <p className="text-muted-foreground">Choose your method and start contacting</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-secondary/50 border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Loaded File</h3>
                </div>
                <p className="text-sm text-muted-foreground">{fileName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {phoneNumbers.length} phone numbers ready
                </p>
              </div>
              
              <div className="bg-secondary/50 border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Choose Action</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => setActionType("call")}
                    variant={actionType === "call" ? "default" : "outline"}
                    className="w-full"
                    size="sm"
                  >
                    📞 Call
                  </Button>
                  <Button
                    onClick={() => setActionType("sms")}
                    variant={actionType === "sms" ? "default" : "outline"}
                    className="w-full"
                    size="sm"
                  >
                    💬 SMS
                  </Button>
                  <Button
                    onClick={() => setActionType("whatsapp")}
                    variant={actionType === "whatsapp" ? "default" : "outline"}
                    className="w-full"
                    size="sm"
                  >
                    📱 WhatsApp
                  </Button>
                </div>
                {(actionType === "sms" || actionType === "whatsapp") && (
                  <p className="text-xs text-muted-foreground mt-3 p-2 bg-primary/10 rounded">
                    Message: "Your Son/daughter did not come to college today"
                  </p>
                )}
              </div>
              
              {isCalling && (
                <div className="bg-primary/10 border border-primary rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground">
                    Processing: {currentIndex + 1} of {phoneNumbers.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {phoneNumbers[currentIndex]}
                  </p>
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={startAction} 
                disabled={isCalling || phoneNumbers.length === 0}
                className="w-full gap-2"
                variant="success"
                size="lg"
              >
                <Phone className="w-5 h-5" />
                {isCalling 
                  ? "Processing..." 
                  : `Send ${actionType === "call" ? "Calls" : actionType === "sms" ? "SMS" : "WhatsApp"} (${phoneNumbers.length} numbers)`
                }
              </Button>
            </div>
            
            <div className="bg-secondary/50 border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2 text-foreground">📱 Mobile App Features:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Make calls, send SMS, or WhatsApp messages</li>
                <li>✓ Upload Excel files directly from your device</li>
                <li>✓ Automatic action logging</li>
                <li>✓ 10-second delay between actions</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Call;
