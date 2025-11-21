import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock, AlertTriangle } from "lucide-react";
import apiClient from "@/lib/api-client";
import clientService from "@/services/clients";
/* ShadCN UI components (pre-built in template) */
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
/**
 * SetupPage
 *
 * Page responsible for validating a magic link token and allowing the client
 * to set a password to complete account setup.
 *
 * URL query parameters:
 *  - clientId
 *  - token
 *
 * Flow:
 *  - On mount, parse clientId & token from URL.
 *  - Call clientService.validateMagicLink(clientId, token)
 *  - If valid, show password form (with zod validation).
 *  - On submit call clientService.completeSetup(clientId, token, password)
 *  - On success redirect to /auth/login with a success toast.
 */
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [clientName, setClientName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  useEffect(() => {
    let mounted = true;
    const validate = async () => {
      if (!clientId || !token) {
        setIsTokenValid(false);
        setErrorMessage("Missing or invalid link. Please request a new setup link.");
        return;
      }
      setIsLoading(true);
      setErrorMessage("");
      try {
        // Expectation: clientService.validateMagicLink returns something like:
        // { valid: boolean, clientName?: string } or throws on error.
        const res = await clientService.validateMagicLink(clientId, token);
        // Defensive handling for multiple shapes
        const valid = !!(res && (res.valid === true || res.isValid === true));
        const name =
          (res && (res.clientName || (res.client && res.client.name) || res.name)) || "";
        if (mounted) {
          setIsTokenValid(valid);
          if (valid) {
            setClientName(name || "");
          } else {
            setErrorMessage(
              (res && (res.error || res.message)) ||
                "This setup link is invalid or has expired. Request a new link."
            );
          }
        }
      } catch (err: any) {
        console.error("validateMagicLink error:", err);
        if (mounted) {
          setIsTokenValid(false);
          setErrorMessage(
            err?.message || "An unexpected error occurred while validating the link."
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    validate();
    return () => {
      mounted = false;
    };
  }, [clientId, token]);
  const onSubmit = async (values: SetupFormValues) => {
    if (!clientId || !token) {
      setErrorMessage("Missing setup token. Please request a new link.");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      await clientService.completeSetup(clientId, token, values.password);
      toast.success("Account setup complete. Please login.");
      navigate("/auth/login");
    } catch (err: any) {
      console.error("completeSetup error:", err);
      const msg = err?.message || "Failed to complete setup. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <Card className="w-full max-w-2xl shadow-lg rounded-xl overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-slate-700" />
            <div>
              <CardTitle>Complete account setup</CardTitle>
              <CardDescription>
                {clientName ? `Welcome, ${clientName}. Create a password to secure your account.` : "Set a password to finish onboarding."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && isTokenValid === null ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin mr-2 h-6 w-6" />
            </div>
          ) : isTokenValid === false ? (
            <div className="py-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
                <div>
                  <p className="font-medium text-red-700">Invalid or expired link</p>
                  <p className="text-sm text-slate-600 mt-1">{errorMessage || "This link is no longer valid."}</p>
                  <div className="mt-4">
                    <Link to="/auth/login" className="text-sm text-sky-600 hover:underline">
                      Return to login
                    </Link>
                    <span className="mx-2 text-slate-400">·</span>
                    <Link to="/auth/forgot" className="text-sm text-sky-600 hover:underline">
                      Request a new link
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : isTokenValid === true ? (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Create a secure password"
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-sm text-slate-500 mt-2">
                          Minimum 8 characters, including uppercase, lowercase, number & special character.
                        </p>
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
                          <Input
                            {...field}
                            type="password"
                            placeholder="Repeat your password"
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {errorMessage && (
                    <div className="text-sm text-red-600">
                      {errorMessage}
                    </div>
                  )}
                  <CardFooter className="pt-0">
                    <div className="flex items-center justify-between w-full gap-4">
                      <Button
                        type="submit"
                        className="flex items-center gap-2"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Set Password"}
                      </Button>
                      <Link to="/auth/login" className="text-sm text-slate-600 hover:underline">
                        Cancel
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              </Form>
            </>
          ) : (
            // Initial fallback (shouldn't normally appear because state handled above)
            <div className="py-6">
              <p className="text-slate-700">Preparing setup...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default SetupPage;