import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import * as XLSX from "xlsx";

const Setup = () => {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const numbers = jsonData
          .map((row: any) => String(row.Number || row.number || row.Phone || row.phone || "").trim())
          .filter(num => num && num !== "nan");
        
        setPhoneNumbers(numbers);
        toast.success(`Loaded ${numbers.length} phone numbers`);
      } catch (error) {
        toast.error("Failed to read Excel file");
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phoneNumbers.length === 0) {
      toast.error("Please upload an Excel file with phone numbers");
      return;
    }
    
    localStorage.setItem("phone_numbers", JSON.stringify(phoneNumbers));
    localStorage.setItem("file_name", fileName);
    
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
                <Label htmlFor="excel-file">Excel File with Phone Numbers</Label>
                <div className="flex gap-2">
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="bg-input border-border"
                  />
                  <Button type="button" variant="outline" size="icon" asChild>
                    <label htmlFor="excel-file" className="cursor-pointer">
                      <Upload className="w-4 h-4" />
                    </label>
                  </Button>
                </div>
                {fileName && (
                  <p className="text-xs text-muted-foreground">
                    ✓ {fileName} - {phoneNumbers.length} numbers loaded
                  </p>
                )}
                {!fileName && (
                  <p className="text-xs text-muted-foreground">
                    Upload Excel file with a "Number" column containing phone numbers
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full gap-2" 
                variant="success"
                disabled={phoneNumbers.length === 0}
              >
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
