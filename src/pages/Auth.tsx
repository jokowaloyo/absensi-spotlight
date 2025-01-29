import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Attempting authentication...", { isSignUp, email }); // Debug log
    
    try {
      if (isSignUp) {
        console.log("Attempting signup..."); // Debug log
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        
        console.log("Signup response:", { data, error }); // Debug log
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Registration successful! Please check your email to verify your account. You'll need to verify your email before you can log in.",
        });
      } else {
        console.log("Attempting login..."); // Debug log
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        console.log("Login response:", { data, error }); // Debug log
        
        if (error) {
          if (error.message === "Email not confirmed") {
            throw new Error(
              "Please verify your email address before logging in. Check your inbox for a verification email."
            );
          }
          if (error.message === "Invalid login credentials") {
            throw new Error("Invalid email or password. Please try again.");
          }
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Successfully logged in!",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      // Show a more detailed toast for email verification errors
      if (error.message.includes("verify your email")) {
        toast({
          variant: "destructive",
          title: "Email Verification Required",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An error occurred during authentication",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{isSignUp ? "Sign Up" : "Login"}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Create a new account to get started. You'll need to verify your email before logging in." 
              : "Welcome back! Please enter your credentials"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !email || password.length < 6}
            >
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setEmail("");
                setPassword("");
              }}
            >
              {isSignUp ? "Already have an account? Login" : "Need an account? Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;