import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";

const Call = () => {
  const navigate = useNavigate();
  const [deviceId, setDeviceId] = useState("");
  const [excelPath, setExcelPath] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const savedDeviceId = localStorage.getItem("device_id");
    const savedExcelPath = localStorage.getItem("excel_path");
    
    if (!savedDeviceId || !savedExcelPath) {
      toast.error("Please complete setup first");
      navigate("/setup");
      return;
    }
    
    setDeviceId(savedDeviceId);
    setExcelPath(savedExcelPath);
  }, [navigate]);

  const generatePythonScript = () => {
    const script = `import os, pandas as pd, time

ADB = r"C:\\\\Users\\\\NXTWAVE\\\\Downloads\\\\platform-tools-latest-windows\\\\platform-tools\\\\adb.exe"
DEVICE_ID = "${deviceId}"
EXCEL_PATH = r"${excelPath}"

df = pd.read_excel(EXCEL_PATH)

for _, row in df.iterrows():
    number = str(row["Number"]).strip()
    if not number or number.lower() == "nan":
        continue
    
    cmd = f'"{ADB}" -s {DEVICE_ID} shell am start -a android.intent.action.CALL -d tel:{number}'
    os.system(cmd)
    print(f"[SUCCESS] Call initiated for {number}")
    time.sleep(10)

print("\\n[COMPLETE] All calls have been processed.")
`;
    
    const blob = new Blob([script], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "call_automation.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Python script downloaded!");
  };

  const simulateCalling = () => {
    setIsSimulating(true);
    
    // Simulate call progress
    const numbers = ["555-0100", "555-0101", "555-0102", "555-0103"];
    let count = 0;
    
    const interval = setInterval(() => {
      if (count < numbers.length) {
        toast.success(`Call initiated: ${numbers[count]}`);
        
        // Save to call log
        const logs = JSON.parse(localStorage.getItem("call_logs") || "[]");
        logs.push({
          number: numbers[count],
          timestamp: new Date().toISOString(),
          status: "success"
        });
        localStorage.setItem("call_logs", JSON.stringify(logs));
        
        count++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        toast.success("All calls completed!", {
          description: "View the call log for details",
        });
        setTimeout(() => navigate("/log"), 1500);
      }
    }, 2000);
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
              <div className="space-y-2">
                <Label>Device ID</Label>
                <Input
                  type="text"
                  value={deviceId}
                  readOnly
                  className="bg-secondary border-border text-muted-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Excel File Path</Label>
                <Input
                  type="text"
                  value={excelPath}
                  readOnly
                  className="bg-secondary border-border text-muted-foreground"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Button 
                onClick={simulateCalling} 
                disabled={isSimulating}
                className="gap-2"
                variant="success"
              >
                <Phone className="w-4 h-4" />
                {isSimulating ? "Calling..." : "Start Calling"}
              </Button>
              
              <Button 
                onClick={generatePythonScript}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download Python Script
              </Button>
            </div>
            
            <div className="bg-secondary/50 border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2 text-foreground">Note:</h3>
              <p className="text-xs text-muted-foreground">
                The "Start Calling" button simulates the process. Download the Python script to run actual ADB calls on your device.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Call;
