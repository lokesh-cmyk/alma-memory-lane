import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Smartphone, MessageCircle, Mail, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const WHATSAPP_SENDER = "+14155238886";

const Auth = () => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<'phone' | 'email' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendPhoneOtp = async () => {
    if (!phone.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your WhatsApp number to continue.",
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
        console.error("Error sending WhatsApp OTP:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to send verification code. Please try again.",
          variant: "destructive",
        });
      } else {
        setStep('otp');
        toast({
          title: "Code sent!",
          description: "Check your WhatsApp for the verification code.",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!email.trim() || !name.trim() || !phone.trim()) {
      toast({
        title: "All fields required",
        description: "Please fill in name, email, and WhatsApp number.",
        variant: "destructive",
      });
      return;
    }

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
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          data: {
            display_name: name.trim(),
            phone: phone.trim(),
          }
        }
      });

      if (error) {
        console.error("Error sending email OTP:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to send verification code. Please try again.",
          variant: "destructive",
        });
      } else {
        setStep('otp');
        toast({
          title: "Code sent!",
          description: "Check your email for the verification code.",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast({
        title: "Verification code required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let verifyResult;
      
      if (authMode === 'signin') {
        // Phone-based signin
        verifyResult = await supabase.auth.verifyOtp({
          phone: phone.trim(),
          token: otp.trim(),
          type: 'sms'
        });
      } else {
        // Email-based signup
        verifyResult = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otp.trim(),
          type: 'email'
        });
      }

      if (verifyResult.error) {
        console.error("Error verifying OTP:", verifyResult.error);
        toast({
          title: "Invalid code",
          description: verifyResult.error.message || "The verification code is incorrect. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // For email signup, update profile with name and phone
      if (authMode === 'signup' && verifyResult.data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: verifyResult.data.user.id,
            display_name: name.trim(),
            phone: phone.trim(),
          }, {
            onConflict: 'user_id'
          });

        if (profileError) {
          console.error("Error updating profile:", profileError);
          // Don't block login for profile update failures
        }
      }

      toast({
        title: "Success!",
        description: "You have been signed in successfully.",
      });
      navigate("/");
    } catch (err) {
      console.error("Unexpected error during verification:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background/80 backdrop-blur-sm border-white/20 shadow-elegant">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow mx-auto mb-4">
            {step === 'phone' ? (
              <Smartphone className="w-8 h-8 text-white" />
            ) : step === 'email' ? (
              <Mail className="w-8 h-8 text-white" />
            ) : (
              <MessageCircle className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome to MeetAlma
          </CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'Sign in with your WhatsApp number or create account' 
              : step === 'email'
              ? 'Enter your details to create an account'
              : 'Enter the verification code we sent you'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'phone' ? (
            <>
              {authMode === 'signin' && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Your WhatsApp Number
                  </Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
              )}

              {authMode === 'signin' ? (
                <>
                  <Button 
                    onClick={handleSendPhoneOtp} 
                    className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-glow"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send WhatsApp Code"}
                  </Button>

                  <div className="text-center">
                    <button
                      onClick={() => setAuthMode('signup')}
                      className="text-sm text-primary hover:underline"
                      disabled={loading}
                    >
                      Don't have an account? Sign up with email
                    </button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    We'll send a verification code to your WhatsApp from {WHATSAPP_SENDER}
                  </div>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => setStep('email')} 
                    className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-glow"
                    disabled={loading}
                  >
                    Create Account with Email
                  </Button>

                  <div className="text-center">
                    <button
                      onClick={() => setAuthMode('signin')}
                      className="text-sm text-primary hover:underline"
                      disabled={loading}
                    >
                      Already have an account? Sign in with WhatsApp
                    </button>
                  </div>
                </>
              )}
            </>
          ) : step === 'email' ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone-signup" className="text-sm font-medium">
                    Your WhatsApp Number
                  </Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="phone-signup"
                      type="tel"
                      placeholder="e.g., +14155551234"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleSendEmailOtp} 
                  className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-glow"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Email Verification"}
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={() => setStep('phone')} 
                  className="w-full"
                  disabled={loading}
                >
                  Back to Sign In
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                We'll send a verification code to your email
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold">Enter Verification Code</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {authMode === 'signin' 
                      ? `Check WhatsApp ${WHATSAPP_SENDER} for your 6-digit code sent to ${phone}`
                      : `Check your email ${email} for the 6-digit verification code`
                    }
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
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

              <div className="space-y-3">
                <Button 
                  onClick={handleVerifyOtp} 
                  className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-glow"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setStep(authMode === 'signin' ? 'phone' : 'email');
                    setOtp('');
                  }} 
                  className="w-full"
                  disabled={loading}
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;