import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { clientService } from "@/services/clients";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must include at least one uppercase letter")
  .regex(/[a-z]/, "Must include at least one lowercase letter")
  .regex(/[0-9]/, "Must include at least one number")
  .regex(/[^A-Za-z0-9]/, "Must include at least one special character");
const setupSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type SetupFormValues = z.infer<typeof setupSchema>;
const SetupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clientId = searchParams.get("clientId") ?? "";
  const token = searchParams.get("token") ?? "";
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [clientName, setClientName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  useEffect(() => {
    const validate = async () => {
      if (!clientId || !token) {
        setIsTokenValid(false);
        setErrorMessage("Missing or invalid link. Please request a new setup link.");
        setIsLoading(false);
        return;
      }
      try {
        const client = await clientService.validateMagicLink(clientId, token);
        if (client) {
          setIsTokenValid(true);
          setClientName(client.name);
        } else {
          setIsTokenValid(false);
          setErrorMessage("This setup link is invalid or has expired. Request a new link.");
        }
      } catch (err: any) {
        setIsTokenValid(false);
        setErrorMessage(err?.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    validate();
  }, [clientId, token]);
  const onSubmit = async (values: SetupFormValues) => {
    setIsSubmitting(true);
    try {
      await clientService.completeSetup(clientId, token, values.password);
      toast.success("Account setup complete. Please log in.");
      navigate("/login");
    } catch (err: any) {
      const msg = err?.message || "Failed to complete setup. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Complete Account Setup</CardTitle>
            <CardDescription>
              {clientName ? `Welcome, ${clientName}. Create a password to secure your account.` : "Set a password to finish onboarding."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin h-6 w-6 text-primary" />
                <p className="ml-2 text-muted-foreground">Validating link...</p>
              </div>
            ) : !isTokenValid ? (
              <div className="flex items-start gap-3 text-destructive-foreground bg-destructive/10 p-4 rounded-md border border-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold">Link Invalid or Expired</h3>
                  <p className="text-sm mt-1">{errorMessage}</p>
                  <Button asChild variant="link" className="p-0 h-auto mt-2 text-destructive-foreground/80">
                    <Link to="/login">Return to Login</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                    Set Password & Finish
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default SetupPage;