import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

const Setup = () => {
  const navigate = useNavigate();
  const [deviceId, setDeviceId] = useState("");
  const [excelPath, setExcelPath] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deviceId || !excelPath) {
      toast.error("Please fill all fields");
      return;
    }
    
    localStorage.setItem("device_id", deviceId);
    localStorage.setItem("excel_path", excelPath);
    
    toast.success("Setup saved successfully!", {
      description: "Redirecting to call launcher...",
    });
    
    setTimeout(() => navigate("/call"), 1000);
  };

  return (
    <>
      <Navbar />
      <div 
        className="min-h-screen flex items-center justify-center p-4 pt-24 relative"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="absolute inset-0 bg-gradient-overlay" />
        
        <Card className="w-full max-w-lg relative z-10 bg-gradient-card backdrop-blur-xl border-border/50 p-8 animate-fade-in">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold text-foreground">Device Setup</h1>
              <p className="text-muted-foreground">Configure your device and data source</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="device-id">Device ID</Label>
                <Input
                  id="device-id"
                  type="text"
                  placeholder="e.g., emulator-5554 or device serial number"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="bg-input border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Your ADB device ID (use 'adb devices' to find it)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excel-path">Excel File Path</Label>
                <Input
                  id="excel-path"
                  type="text"
                  placeholder="e.g., C:\Users\...\contacts.xlsx"
                  value={excelPath}
                  onChange={(e) => setExcelPath(e.target.value)}
                  className="bg-input border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Full path to your Excel file with phone numbers
                </p>
              </div>
              
              <Button type="submit" className="w-full gap-2" variant="success">
                Save & Proceed
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Setup;
