"use client";
import Link from "next/link";
import type React from "react";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "react-query";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  CheckIcon, Sparkles,
  Shield, Zap,
  BookOpen,
  ShieldCheck
} from "lucide-react";
import { Logo } from "@/components/logo";
import { api, paramsType } from "@/api";
import { SIGNUP_API } from "@/contants/api-url/auth";
import { checkSuccessResponse } from "@/utils/common";
import {
  DEFAULT_PAGE_ON_LOGIN
} from "@/contants/appConstant";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { setAccessTokenInLocalStorage } from "@/utils/auth";
import { useAuth } from "@/context/auth-context/AuthContextProvider";

// Custom icon components
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      {...props}
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MicrosoftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 23 23"
      width="23"
      height="23"
      {...props}
    >
      <path fill="#f1511b" d="M1 1h10v10H1z" />
      <path fill="#80cc28" d="M12 1h10v10H12z" />
      <path fill="#00adef" d="M1 12h10v10H1z" />
      <path fill="#fbbc09" d="M12 12h10v10H12z" />
    </svg>
  );
}

const defaultValues = {
  name: "",
  email: "",
  password: "",
};

function SignupPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [billingCycle, setBillingCycle] = useState("yearly");
  const [selectedPlan, setSelectedPlan] = useState("department");
  const router = useRouter();
  const { setUser } = useAuth();

  const schema = yup.object().shape({
    name: yup
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaultValues,
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    reset(defaultValues);
  }, []);

  // Api call mutation
  const signupApi = useMutation(
    async (payload: paramsType) => {
      const response = await api({
        endpoint: SIGNUP_API,
        payloadData: payload,
      });
      return response;
    },
    {
      onSuccess: (response) => {
        if (checkSuccessResponse(response)) {
          const responseData = response?.data?.data;
          if (responseData?.token) {
            setAccessTokenInLocalStorage(responseData?.token);
            setUser(responseData?.user);
            router.push(DEFAULT_PAGE_ON_LOGIN);
          }
        }
      },
      onError: () => {},
    }
  );

  const onSubmit = async (data = defaultValues) => {
    console.log(data);
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
    };

    await signupApi.mutateAsync(payload);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const plans = {
    monthly: {
      educator: {
        name: "Educator",
        price: "$14.99",
        period: "/month",
        yearlyPrice: "$143.90",
        yearlyPeriod: "/year",
        savings: "Save 20%",
        features: [
          "Grade up to 5 classes with AI precision",
          "Create custom assignments in seconds",
          "Provide detailed, personalized feedback",
          "Detect AI-generated content automatically",
          "Access email support within 24 hours",
        ],
      },
      department: {
        name: "Department",
        price: "$74.99",
        period: "/month",
        yearlyPrice: "$719.90",
        yearlyPeriod: "/year",
        savings: "Save 20%",
        popular: true,
        features: [
          "Support for up to 25 classes with full analytics",
          "Everything in Educator plan, plus:",
          "Team collaboration with 5 teacher accounts",
          "Advanced plagiarism & AI detection tools",
          "Priority support with 12-hour response time",
        ],
      },
      institution: {
        name: "Institution",
        price: "$149.99",
        period: "/month",
        yearlyPrice: "$1,439.90",
        yearlyPeriod: "/year",
        savings: "Save 20%",
        features: [
          "Unlimited classes with institution-wide insights",
          "Everything in Department plan, plus:",
          "Unlimited teacher collaboration & accounts",
          "Seamless LMS integration with Canvas, Moodle & more",
          "Dedicated support manager & 24/7 assistance",
        ],
      },
    },
    yearly: {
      educator: {
        name: "Educator",
        price: "$143.90",
        period: "/year",
        monthlyEquivalent: "$11.99/mo",
        savings: "Save 20%",
        features: [
          "Grade up to 5 classes with AI precision",
          "Create custom assignments in seconds",
          "Provide detailed, personalized feedback",
          "Detect AI-generated content automatically",
          "Access email support within 24 hours",
        ],
      },
      department: {
        name: "Department",
        price: "$719.90",
        period: "/year",
        monthlyEquivalent: "$59.99/mo",
        savings: "Save 20%",
        popular: true,
        features: [
          "Support for up to 25 classes with full analytics",
          "Everything in Educator plan, plus:",
          "Team collaboration with 5 teacher accounts",
          "Advanced plagiarism & AI detection tools",
          "Priority support with 12-hour response time",
        ],
      },
      institution: {
        name: "Institution",
        price: "$1,439.90",
        period: "/year",
        monthlyEquivalent: "$119.99/mo",
        savings: "Save 20%",
        features: [
          "Unlimited classes with institution-wide insights",
          "Everything in Department plan, plus:",
          "Unlimited teacher collaboration & accounts",
          "Seamless LMS integration with Canvas, Moodle & more",
          "Dedicated support manager & 24/7 assistance",
        ],
      },
    },
  };

  const isLoading = useMemo(() => {
    return signupApi.isLoading;
  }, [signupApi.isLoading, isSubmitting]);
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="mx-auto w-full max-w-5xl grid md:grid-cols-5 gap-6">
        {/* Left side - Benefits */}
        <div className="md:col-span-2 hidden md:flex flex-col justify-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">
              Unlock Effortless Teaching with Your AI Assistant
            </h2>
            <p className="text-muted-foreground">
              Join a community of educators who are transforming their
              classrooms with the power of AI.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Reclaim Your Time</h3>
                <p className="text-sm text-muted-foreground">
                  Automate tedious tasks and focus on what you love: connecting
                  with students.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Elevate Student Success</h3>
                <p className="text-sm text-muted-foreground">
                  Provide personalized feedback that fosters growth and
                  understanding.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Maintain Academic Integrity</h3>
                <p className="text-sm text-muted-foreground">
                  Confidently uphold standards with advanced AI and plagiarism
                  detection.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <blockquote className="text-sm italic">
              "GradeGenie has given me back my evenings and weekends! I'm more
              present for my students and my family."
            </blockquote>
            <div className="mt-2 text-sm font-medium">
              — Sarah Johnson, High School English Teacher
            </div>
          </div>
        </div>

        {/* Right side - Signup form */}
        <Card className="md:col-span-3 w-full">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <Logo size="md" />
            </div>
            <CardTitle className="text-center text-2xl font-bold">
              {step === 1 && "Start Your Effortless Teaching Journey"}
              {step === 2 && "Choose Your Teaching Support Plan"}
              {step === 3 && "Complete Your Registration"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 &&
                "Get 30 AI grading credits to experience the GradeGenie difference"}
              {step === 2 &&
                "Select the support level that fits your teaching needs — no charges during trial"}
              {step === 3 &&
                "Your trial begins today — no charges until it ends"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    Google
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MicrosoftIcon className="mr-2 h-5 w-5" />
                    Microsoft
                  </Button>
                </div> */}

              {/* <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div> */}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { value, onChange } }) => (
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Smith"
                        required
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Work or .edu email</Label>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { value, onChange } }) => {
                      return (
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@edu.com"
                          required
                          value={value}
                          onChange={onChange}
                        />
                      );
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { value, onChange } }) => {
                      return (
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          required
                          value={value}
                          onChange={onChange}
                        />
                      );
                    }}
                  />

                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  Your 3-day trial empowers you with:
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                    <span>
                      <strong>30 grading credits</strong> to streamline your
                      assessment workflow
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                    <span>
                      Complete access to all teaching enhancement tools
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                    <span>Flexible cancellation — you maintain control</span>
                  </li>
                </ul>
              </div>

              <Button className="w-full py-6 text-base" type="submit">
                Start Your Free, Effortless Teaching Journey
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-2">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline underline-offset-2">
                  Privacy Policy
                </Link>
              </p>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-4">
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </div>
            <div className="flex items-center justify-center text-xs text-gray-500">
              <ShieldCheck className="mr-1 h-3 w-3" /> Secure login
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

SignupPage.authGuard = false;
SignupPage.guestGuard = true;

export default SignupPage;
