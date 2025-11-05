import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Phone, FileText, Mic, Square } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

const Call = () => {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [isCalling, setIsCalling] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionType, setActionType] = useState<"call" | "sms" | "whatsapp">("call");
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState("Your Son/daughter did not come to college today");
  const [whatsappWindow, setWhatsappWindow] = useState<Window | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentCallLogId, setCurrentCallLogId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start recording. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  const uploadRecording = async (audioBlob: Blob) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to save recordings");
        return;
      }

      const fileName = `recording_${Date.now()}.webm`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('call-recordings')
        .upload(filePath, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('call-recordings')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('call_recordings')
        .insert({
          user_id: user.id,
          log_id: currentCallLogId,
          phone_number: phoneNumbers[currentIndex],
          recording_url: publicUrl,
        });

      if (dbError) throw dbError;

      toast.success("Recording saved successfully!");
    } catch (error) {
      console.error('Error uploading recording:', error);
      toast.error("Failed to save recording");
    }
  };

  const performAction = (phoneNumber: string) => {
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
          actionUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;
          status = "whatsapp sent";
          toast.success(`📱 Opening WhatsApp for ${phoneNumber}...`);
          break;
      }
      
      // Open the action URL - use location.href for tel/sms to work properly on mobile
      if (actionType === "call" || actionType === "sms") {
        window.location.href = actionUrl;
      } else if (actionType === "whatsapp") {
        // Reuse the same WhatsApp window/tab
        if (whatsappWindow && !whatsappWindow.closed) {
          whatsappWindow.location.href = actionUrl;
          whatsappWindow.focus();
        } else {
          const newWindow = window.open(actionUrl, 'whatsapp_tab');
          setWhatsappWindow(newWindow);
        }
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
  };

  const startAction = async () => {
    if (phoneNumbers.length === 0) {
      toast.error("No phone numbers available");
      return;
    }

    if (actionType === "whatsapp" && !whatsappMessage.trim()) {
      toast.error("Please enter a message for WhatsApp");
      return;
    }

    if (broadcastMode && actionType === "whatsapp") {
      // Open all WhatsApp chats at once
      phoneNumbers.forEach((phoneNumber, index) => {
        setTimeout(() => {
          const actionUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;
          window.open(actionUrl, '_blank');
          
          const logs = JSON.parse(localStorage.getItem("call_logs") || "[]");
          logs.push({
            number: phoneNumber,
            timestamp: new Date().toISOString(),
            status: "whatsapp opened",
            type: "whatsapp"
          });
          localStorage.setItem("call_logs", JSON.stringify(logs));
        }, index * 500); // 500ms delay between each
      });
      
      toast.success(`Opening ${phoneNumbers.length} WhatsApp chats...`, {
        description: "Send your message in each chat, then check the log",
      });
      
      setTimeout(() => {
        navigate("/log");
      }, phoneNumbers.length * 500 + 2000);
      return;
    }

    // Create a call log session
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('call_logs')
          .insert({
            user_id: user.id,
            session_name: fileName,
            total_calls: phoneNumbers.length,
            completed_calls: 0,
          })
          .select()
          .single();

        if (!error && data) {
          setCurrentCallLogId(data.id);
        }
      }
    } catch (error) {
      console.error('Error creating call log:', error);
    }

    // Reset WhatsApp window for new session
    setWhatsappWindow(null);
    
    setIsCalling(true);
    setCurrentIndex(0);
    setWaitingForNext(false);
    setIsComplete(false);
    performAction(phoneNumbers[0]);
    setWaitingForNext(true);
  };

  const handleNextAction = () => {
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= phoneNumbers.length) {
      // All done
      setIsCalling(false);
      setWaitingForNext(false);
      setIsComplete(true);
      const actionText = actionType === "call" ? "calls" : actionType === "sms" ? "messages" : "WhatsApp messages";
      toast.success(`All ${actionText} completed!`, {
        description: "View the log for details",
      });
      setTimeout(() => navigate("/log"), 2000);
      return;
    }
    
    setCurrentIndex(nextIndex);
    performAction(phoneNumbers[nextIndex]);
    setWaitingForNext(true);
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
                  <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="broadcast"
                        checked={broadcastMode}
                        onChange={(e) => setBroadcastMode(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <label htmlFor="broadcast" className="text-xs font-medium text-foreground cursor-pointer">
                        🚀 Broadcast Mode (Opens all chats at once - fastest!)
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">Your Message:</label>
                      <textarea
                        value={whatsappMessage}
                        onChange={(e) => setWhatsappMessage(e.target.value)}
                        placeholder="Enter your WhatsApp message..."
                        className="w-full min-h-[80px] p-2 text-sm rounded-md border border-input bg-background"
                      />
                    </div>
                  </div>
                )}
                
                {actionType === "sms" && (
                  <p className="text-xs text-muted-foreground mt-3 p-2 bg-primary/10 rounded">
                    Message: "Your Son/daughter did not come to college today"
                  </p>
                )}
              </div>
              
              {(isCalling && waitingForNext) && (
                <div className="bg-primary/10 border border-primary rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-foreground">
                      Completed: {currentIndex + 1} of {phoneNumbers.length}
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
                    ✅ Last: {phoneNumbers[currentIndex]}
                  </p>
                  {currentIndex + 1 < phoneNumbers.length && (
                    <p className="text-xs text-muted-foreground">
                      📞 Next: {phoneNumbers[currentIndex + 1]}
                    </p>
                  )}

                  {actionType === "call" && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={isRecording ? stopRecording : startRecording}
                        variant={isRecording ? "destructive" : "outline"}
                        size="sm"
                        className="gap-2"
                      >
                        {isRecording ? (
                          <>
                            <Square className="w-4 h-4" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                            Record Call
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleNextAction}
                    className="w-full gap-2 mt-3"
                    variant="default"
                    size="lg"
                  >
                    {currentIndex + 1 < phoneNumbers.length 
                      ? `Next ${actionType === "call" ? "Call" : actionType === "sms" ? "SMS" : "WhatsApp"} →`
                      : "Finish & View Log"
                    }
                  </Button>
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
                  ? "In Progress..." 
                  : `Start ${actionType === "call" ? "Calls" : actionType === "sms" ? "SMS" : "WhatsApp"} (${phoneNumbers.length} numbers)`
                }
              </Button>
            </div>
            
            <div className="bg-secondary/50 border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2 text-foreground">📱 How It Works:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Click Start to begin first call/SMS/WhatsApp</li>
                <li>✓ Complete the action (call, send message, etc.)</li>
                <li>✓ Return to this page</li>
                <li>✓ Click "Next" button to proceed to next number</li>
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
