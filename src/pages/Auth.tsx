import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Smartphone, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const WHATSAPP_SENDER = "+14155238886";
const TWILIO_CALLBACK_URL = "https://timberwolf-mastiff-9776.twil.io/demo-reply";

const Auth = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    // Ensure E.164 format for WhatsApp/Twilio
    if (!/^\+[1-9]\d{7,14}$/.test(phone.trim())) {
      toast({
        title: "Invalid phone format",
        description: "Use E.164 format, e.g., +14155551234",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
        options: {
          channel: 'whatsapp',
          shouldCreateUser: true,
        }
      });

      if (error) {
        toast({
          title: "Error sending OTP",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setStep("otp");
        toast({
          title: "OTP sent!",
          description: "Check your WhatsApp for the verification code",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: otp,
        type: 'sms'
      });

      if (error) {
        toast({
          title: "Invalid OTP",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome to MeetAlma!",
          description: "Authentication successful",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-elevated border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome to MeetAlma
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Your AI-powered personal memory companion
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === "phone" ? (
            <>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., +14155551234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSendOtp} 
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send WhatsApp Code"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                We'll send a verification code to your WhatsApp from {WHATSAPP_SENDER}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold">Enter Verification Code</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check WhatsApp {WHATSAPP_SENDER} for your 6-digit code sent to {phone}
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button 
                onClick={handleVerifyOtp}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setStep("phone")}
                className="w-full"
                disabled={loading}
              >
                Back to phone number
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;