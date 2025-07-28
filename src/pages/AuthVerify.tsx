import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AuthVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const error = searchParams.get("error");
    const verified = searchParams.get("verified");

    if (error) {
      setStatus("error");
      switch (error) {
        case "invalid_token":
          setErrorMessage("The verification link is invalid.");
          break;
        case "invalid_token_type":
          setErrorMessage(
            "The verification link is not valid for email verification."
          );
          break;
        case "user_not_found":
          setErrorMessage("User account not found.");
          break;
        case "expired_token":
          setErrorMessage("The verification link has expired.");
          break;
        default:
          setErrorMessage("An error occurred during verification.");
      }
    } else if (verified === "true") {
      setStatus("success");
    } else {
      // If no params, this might be a direct verification success
      setStatus("success");
    }
  }, [searchParams]);

  // Separate effect to handle redirect when user is authenticated
  useEffect(() => {
    console.log(
      "🔍 AuthVerify - status:",
      status,
      "isLoading:",
      isLoading,
      "isAuthenticated:",
      isAuthenticated
    );

    if (status === "success") {
      // For successful verification, always check auth status directly via API
      // This ensures we get the most up-to-date authentication state
      const checkAuthAndRedirect = async () => {
        try {
          console.log("🔍 AuthVerify - Checking auth status via API...");
          const response = await fetch(
            `${
              import.meta.env.VITE_ENDPOINT || "https://dev.dedi.global"
            }/dedi/auth/me`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            console.log(
              "✅ AuthVerify - User is authenticated, redirecting to dashboard"
            );
            // Give a short delay for user to see the success message
            setTimeout(() => {
              navigate("/dashboard");
            }, 1500);
          } else {
            console.log(
              "❌ AuthVerify - User is not authenticated, redirecting to home"
            );
            setTimeout(() => {
              navigate("/");
            }, 2000);
          }
        } catch (error) {
          console.log("❌ AuthVerify - Error checking auth status:", error);
          setTimeout(() => {
            navigate("/");
          }, 2000);
        }
      };

      // Wait a moment for the cookie to be properly set, then check auth
      setTimeout(checkAuthAndRedirect, 1000);
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            {status === "loading" && (
              <>
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Verifying...
                </CardTitle>
                <CardDescription>
                  Please wait while we verify your email address
                </CardDescription>
              </>
            )}

            {status === "success" && (
              <>
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-700">
                  Email Verified!
                </CardTitle>
                <CardDescription>
                  Your email has been successfully verified. Redirecting to your
                  dashboard...
                </CardDescription>
              </>
            )}

            {status === "error" && (
              <>
                <div className="flex justify-center mb-4">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-red-700">
                  Verification Failed
                </CardTitle>
                <CardDescription className="text-red-600">
                  {errorMessage}
                </CardDescription>
              </>
            )}
          </CardHeader>

          {status === "error" && (
            <CardContent className="space-y-4">
              <Button onClick={() => navigate("/signup")} className="w-full">
                Try Again
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full"
              >
                Go Home
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
