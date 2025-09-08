import { useState, useEffect } from "react";
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

  // Handle Google OAuth redirect callback
  useEffect(() => {
    // Check if user just signed in via OAuth (including Google)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        
        // Check if this is a new user or existing user
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (!existingProfile) {
          // New user - create profile with available data
          const userData = user.user_metadata || {};
          const userEmail = user.email || '';
          const userDisplayName = userData.full_name || userData.name || userEmail.split('@')[0] || '';
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              display_name: userDisplayName,
              phone: userData.phone || '', // Google might not provide phone
            });

          if (profileError) {
            console.error("Error creating profile for OAuth user:", profileError);
            toast({
              title: "Profile Creation Error",
              description: "Account created but profile setup failed. Please contact support.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Welcome!",
              description: "Your account has been successfully created.",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
        }
        
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUserExists = async (email?: string, phone?: string) => {
    try {
      if (email) {
        // Check by attempting to get user profile - if exists, user exists
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id')
          .limit(1);

        // Try a signin attempt to see if user exists (will fail gracefully)
        const { error: signinError } = await supabase.auth.signInWithPassword({
          email: email,
          password: 'dummy-password-check'
        });

        // If error is invalid_credentials, user exists but password wrong
        // If error is invalid_login_credentials, user doesn't exist
        const userExists = signinError?.message?.includes('Invalid login credentials') === false;
        return userExists;
      } else if (phone) {
        // Check by phone in profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('phone', phone)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error checking phone existence:", error);
          return false;
        }

        return !!data;
      }
      
      return false;
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
            emailRedirectTo: `${window.location.origin}/auth`,
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
        // Use custom WhatsApp OTP edge function
        const { data: otpData, error: otpError } = await supabase.functions.invoke('send-whatsapp-otp', {
          body: { 
            to: identifier,
            code: Math.floor(100000 + Math.random() * 900000).toString() // Generate 6-digit code
          }
        });

        if (otpError || !otpData?.success) {
          console.error("Error sending WhatsApp OTP:", otpError);
          toast({
            title: "Error",
            description: otpError?.message || "Failed to send WhatsApp verification code.",
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
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          data: {
            display_name: name.trim(),
            phone: phone.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth`,
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
          type: 'email'
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

      // For signup, create/update profile with phone number
      if (verifyResult.data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: verifyResult.data.user.id,
            display_name: name.trim() || verifyResult.data.user.user_metadata?.display_name || '',
            phone: phone.trim() || verifyResult.data.user.user_metadata?.phone || '',
          }, {
            onConflict: 'user_id'
          });

        if (profileError) {
          console.error("Error updating profile:", profileError);
          toast({
            title: "Profile Error",
            description: "Account created but profile update failed. Please contact support.",
            variant: "destructive",
          });
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

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error("Error with Google auth:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to authenticate with Google.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Unexpected error during Google auth:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during Google authentication.",
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleAuth}
                variant="outline"
                className="w-full border-border bg-background hover:bg-muted text-foreground"
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
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

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleAuth}
                  variant="outline"
                  className="w-full border-border bg-background hover:bg-muted text-foreground"
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
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