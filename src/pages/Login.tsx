import { Stethoscope } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left visual */}
      <div className="hidden lg:flex relative overflow-hidden gradient-primary p-12 flex-col justify-between text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="font-display text-2xl font-bold">ClinLab</span>
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-5xl font-bold leading-tight mb-4">
            Smarter clinical decisions, one note at a time.
          </h1>
          <p className="text-primary-foreground/85 text-lg max-w-md">
            Convert clinical notes into lab requisitions and get the next procedural step — instantly.
          </p>
        </div>
        <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-20 top-20 w-72 h-72 rounded-full bg-accent/40 blur-3xl" />
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 animate-fade-up">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold">ClinLab</span>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to continue your clinical workflow.</p>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email or phone</Label>
              <Input id="email" placeholder="dr.singh@clinic.com" className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot?
                </button>
              </div>
              <Input id="password" type="password" placeholder="••••••••" className="rounded-xl h-11" />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full">
              Sign in
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full rounded-xl"
              onClick={() => navigate("/")}
            >
              Continue as guest
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
