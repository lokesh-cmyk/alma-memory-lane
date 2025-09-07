import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Smartphone, MessageCircle, Mail, User, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const WHATSAPP_SENDER = "+14155238886";

const Auth = () => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'signin' | 'signup' | 'otp'>('signin');
  const [signinMethod, setSigninMethod] = useState<'phone' | 'email'>('email');
  const [otpMethod, setOtpMethod] = useState<'email' | 'whatsapp'>('email');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkUserExists = async (email?: string, phone?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, phone, display_name')
        .or(
          email ? `user_id.in.(select id from auth.users where email='${email}')` : 
          `phone.eq.${phone}`
        )
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking user existence:", error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error("Unexpected error checking user:", err);
      return false;
    }
  };

  const handleSignin = async () => {
    const identifier = signinMethod === 'email' ? email.trim() : phone.trim();
    
    if (!identifier) {
      toast({
        title: `${signinMethod === 'email' ? 'Email' : 'Phone number'} required`,
        description: `Please enter your ${signinMethod === 'email' ? 'email address' : 'WhatsApp number'}.`,
        variant: "destructive",
      });
      return;
    }

    if (signinMethod === 'phone' && !/^\+[1-9]\d{7,14}$/.test(identifier)) {
      toast({
        title: "Invalid phone format",
        description: "Use E.164 format, e.g., +14155551234",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check if user exists
      const userExists = await checkUserExists(
        signinMethod === 'email' ? identifier : undefined,
        signinMethod === 'phone' ? identifier : undefined
      );

      if (!userExists) {
        toast({
          title: "Account not found",
          description: "Please sign up first to create your account.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Send OTP based on signin method
      if (signinMethod === 'email') {
        const { error } = await supabase.auth.signInWithOtp({
          email: identifier,
          options: {
            shouldCreateUser: false,
          }
        });

        if (error) {
          console.error("Error sending email OTP:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to send verification code.",
            variant: "destructive",
          });
        } else {
          setOtpMethod('email');
          setStep('otp');
          toast({
            title: "Code sent!",
            description: "Check your email for the verification code.",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone: identifier,
          options: {
            channel: 'whatsapp',
            shouldCreateUser: false,
          }
        });

        if (error) {
          console.error("Error sending WhatsApp OTP:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to send verification code.",
            variant: "destructive",
          });
        } else {
          setOtpMethod('whatsapp');
          setStep('otp');
          toast({
            title: "Code sent!",
            description: "Check your WhatsApp for the verification code.",
          });
        }
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

  const handleSignup = async () => {
    // Validate all required fields
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      toast({
        title: "All fields required",
        description: "Please fill in name, email, phone number, and password.",
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

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check if user already exists
      const userExists = await checkUserExists(email.trim());
      
      if (userExists) {
        toast({
          title: "Account already exists",
          description: "Please sign in instead.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create account with email OTP
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            display_name: name.trim(),
            phone: phone.trim(),
          },
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        console.error("Error creating account:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to create account.",
          variant: "destructive",
        });
      } else {
        setOtpMethod('email');
        setStep('otp');
        toast({
          title: "Account created!",
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
      
      if (otpMethod === 'whatsapp') {
        verifyResult = await supabase.auth.verifyOtp({
          phone: phone.trim(),
          token: otp.trim(),
          type: 'sms'
        });
      } else {
        verifyResult = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otp.trim(),
          type: step === 'otp' && name ? 'signup' : 'email'
        });
      }

      if (verifyResult.error) {
        console.error("Error verifying OTP:", verifyResult.error);
        toast({
          title: "Invalid code",
          description: verifyResult.error.message || "The verification code is incorrect.",
          variant: "destructive",
        });
        return;
      }

      // For signup, create/update profile
      if (name && verifyResult.data.user) {
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

  const resetForm = () => {
    setStep('signin');
    setOtp('');
    setEmail('');
    setPhone('');
    setName('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border shadow-elevated">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            {step === 'signin' ? (
              signinMethod === 'email' ? <Mail className="w-8 h-8 text-primary-foreground" /> : <Smartphone className="w-8 h-8 text-primary-foreground" />
            ) : step === 'signup' ? (
              <User className="w-8 h-8 text-primary-foreground" />
            ) : (
              <MessageCircle className="w-8 h-8 text-primary-foreground" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Welcome to MeetAlma
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {step === 'signin' 
              ? `Sign in with your ${signinMethod === 'email' ? 'email' : 'WhatsApp number'}` 
              : step === 'signup'
              ? 'Create your account'
              : 'Enter the verification code we sent you'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'signin' ? (
            <>
              {/* Signin Method Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={signinMethod === 'email' ? 'default' : 'outline'}
                  onClick={() => setSigninMethod('email')}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button
                  variant={signinMethod === 'phone' ? 'default' : 'outline'}
                  onClick={() => setSigninMethod('phone')}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <Smartphone className="w-4 h-4" />
                  WhatsApp
                </Button>
              </div>

              {/* Input Field */}
              <div className="space-y-2">
                <Label htmlFor="signin-input" className="text-sm font-medium text-foreground">
                  {signinMethod === 'email' ? 'Email Address' : 'WhatsApp Number'}
                </Label>
                <div className="relative">
                  {signinMethod === 'email' ? (
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  ) : (
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  )}
                  <Input
                    id="signin-input"
                    type={signinMethod === 'email' ? 'email' : 'tel'}
                    placeholder={signinMethod === 'email' ? 'your@email.com' : 'e.g., +14155551234'}
                    value={signinMethod === 'email' ? email : phone}
                    onChange={(e) => signinMethod === 'email' ? setEmail(e.target.value) : setPhone(e.target.value)}
                    className="pl-10 bg-background border-input text-foreground"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSignin}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                disabled={loading}
              >
                {loading ? "Checking..." : "Sign In"}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setStep('signup')}
                  className="text-sm text-primary hover:underline font-medium"
                  disabled={loading}
                >
                  Don't have an account? Sign up
                </button>
              </div>

              {signinMethod === 'phone' && (
                <div className="text-center text-sm text-muted-foreground">
                  We'll send a verification code to your WhatsApp from {WHATSAPP_SENDER}
                </div>
              )}
            </>
          ) : step === 'signup' ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-background border-input text-foreground"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="text-sm font-medium text-foreground">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background border-input text-foreground"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone-signup" className="text-sm font-medium text-foreground">
                    WhatsApp Number *
                  </Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="phone-signup"
                      type="tel"
                      placeholder="e.g., +14155551234"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 bg-background border-input text-foreground"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Choose a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-background border-input text-foreground"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleSignup}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={() => setStep('signin')} 
                  className="w-full text-foreground hover:bg-muted"
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
                  <h3 className="font-semibold text-foreground">Enter Verification Code</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {otpMethod === 'whatsapp'
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
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={resetForm}
                  className="w-full text-foreground hover:bg-muted"
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