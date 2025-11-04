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
  const [broadcastMode, setBroadcastMode] = useState(false);

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

  const performAction = async (phoneNumber: string, isLast: boolean) => {
    return new Promise<void>((resolve) => {
      try {
        const message = "Your Son/daughter did not come to college today";
        let actionUrl = "";
        let status = "";
        
        switch (actionType) {
          case "call":
            actionUrl = `tel:${phoneNumber}`;
            status = "call initiated";
            toast.success(`📞 Calling ${phoneNumber}...`);
            break;
          case "sms":
            actionUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
            status = "sms sent";
            toast.success(`💬 Sending SMS to ${phoneNumber}...`);
            break;
          case "whatsapp":
            actionUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
            status = "whatsapp sent";
            toast.success(`📱 Sending WhatsApp to ${phoneNumber}...`);
            break;
        }
        
        // Open the action URL - use location.href for tel/sms to work properly on mobile
        if (actionType === "call" || actionType === "sms") {
          window.location.href = actionUrl;
        } else {
          window.open(actionUrl, '_blank');
        }
        
        // Log the action with detailed info
        const logs = JSON.parse(localStorage.getItem("call_logs") || "[]");
        logs.push({
          number: phoneNumber,
          timestamp: new Date().toISOString(),
          status: status,
          type: actionType
        });
        localStorage.setItem("call_logs", JSON.stringify(logs));
        
        console.log(`✓ ${actionType.toUpperCase()} initiated for ${phoneNumber}`);
      } catch (error) {
        console.error('Error performing action:', error);
        toast.error(`❌ Error processing ${phoneNumber}`);
        
        // Log failed action
        const logs = JSON.parse(localStorage.getItem("call_logs") || "[]");
        logs.push({
          number: phoneNumber,
          timestamp: new Date().toISOString(),
          status: "failed",
          type: actionType,
          error: String(error)
        });
        localStorage.setItem("call_logs", JSON.stringify(logs));
      }
      
      // Wait time for next action - longer for calls to allow time to complete the call
      const delayTime = actionType === "call" ? 30000 : actionType === "sms" ? 5000 : 5000;
      
      if (!isLast) {
        console.log(`⏱️ Waiting ${delayTime/1000}s before next action...`);
        setTimeout(() => {
          console.log(`✅ Moving to next number`);
          resolve();
        }, delayTime);
      } else {
        resolve();
      }
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
      const isLast = i === phoneNumbers.length - 1;
      await performAction(phoneNumbers[i], isLast);
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
                    onClick={() => {
                      setActionType("call");
                      setBroadcastMode(false);
                    }}
                    variant={actionType === "call" ? "default" : "outline"}
                    className="w-full"
                    size="sm"
                  >
                    📞 Call
                  </Button>
                  <Button
                    onClick={() => {
                      setActionType("sms");
                      setBroadcastMode(false);
                    }}
                    variant={actionType === "sms" ? "default" : "outline"}
                    className="w-full"
                    size="sm"
                  >
                    💬 SMS
                  </Button>
                  <Button
                    onClick={() => {
                      setActionType("whatsapp");
                      setBroadcastMode(false);
                    }}
                    variant={actionType === "whatsapp" ? "default" : "outline"}
                    className="w-full"
                    size="sm"
                  >
                    📱 WhatsApp
                  </Button>
                </div>
                
                {actionType === "whatsapp" && (
                  <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="broadcast"
                        checked={broadcastMode}
                        onChange={(e) => setBroadcastMode(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <label htmlFor="broadcast" className="text-xs font-medium text-foreground cursor-pointer">
                        🚀 Broadcast Mode (Opens all chats quickly)
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Message: "Your Son/daughter did not come to college today"
                    </p>
                  </div>
                )}
                
                {actionType === "sms" && (
                  <p className="text-xs text-muted-foreground mt-3 p-2 bg-primary/10 rounded">
                    Message: "Your Son/daughter did not come to college today"
                  </p>
                )}
              </div>
              
              {isCalling && (
                <div className="bg-primary/10 border border-primary rounded-lg p-4 space-y-3 animate-pulse">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-foreground">
                      Processing: {currentIndex + 1} of {phoneNumbers.length}
                    </p>
                    <span className="text-xs text-primary font-semibold">
                      {Math.round(((currentIndex + 1) / phoneNumbers.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / phoneNumbers.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    📞 Current: {phoneNumbers[currentIndex]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ⏱️ Next in: {actionType === "call" ? "30s" : "5s"} (auto)
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
              <h3 className="text-sm font-semibold mb-2 text-foreground">📱 How It Works:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Sequential processing - one at a time</li>
                <li>✓ Calls: 30s delay between each (time to complete call)</li>
                <li>✓ SMS/WhatsApp: 5s delay between each</li>
                <li>✓ Next action auto-initiates after delay</li>
                <li>✓ All actions logged with timestamps</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Call;
