import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader, Eye, EyeOff } from "lucide-react"; // Added Eye icons
import { ThemeToggle } from "@/components/ThemeToggle";
import { authService } from "@/services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false); // Password visibility state
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log(`Attempting login with email: ${email}`);
      const { user } = await authService.login(email, password);
      
      console.log(`Login successful as: ${user.email}, role: ${user.role}`);
      
      if (user.role === 'admin') {
        toast({
          title: "Login successful",
          description: "Welcome back, Admin!",
        });
        navigate("/");
      } else {
        toast({
          title: "Login successful",
          description: "Welcome to the Library System!",
        });
        navigate("/member/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      const errorMsg = error.response?.data?.msg || "Invalid credentials. Please try again.";
      setErrorMessage(errorMsg);
      
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Library System</CardTitle>
            <CardDescription>
              Enter your credentials to sign in
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={passwordVisible ? "text" : "password"} // Toggle between text and password
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {/* Password visibility toggle button inside the input field */}
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              
              {errorMessage && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                  {errorMessage}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                ) : (
                  <><LogIn className="mr-2 h-4 w-4" /> Sign In</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
