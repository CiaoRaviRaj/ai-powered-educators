"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery } from "react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SyllabusCreator } from "./syllabus-creator";
import { api } from "@/api";
import { COURSES_API } from "@/contants/api-url/courses";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define the course form schema
const formSchema = z.object({
  courseTitle: z.string().min(2, {
    message: "Course name must be at least 2 characters.",
  }),
  courseDescription: z.string().min(10, {
    message: "Course description must be at least 10 characters.",
  }),
  subjectId: z.string({
    required_error: "Please select a subject.",
  }),
  gradeId: z.string({
    required_error: "Please select a grade level.",
  }),
  generationPrompt: z.string().optional(),
  additionalInformation: z.string().optional(),
  systemPrompt: z.string().optional(),
});

// Type definition for the form values
type CourseFormValues = z.infer<typeof formSchema>;

// Interface matching SyllabusCreator's expected props
interface SyllabusCreatorDetails {
  name: string;
  description: string;
  subject: string;
  gradeLevel: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<CourseFormValues | null>(null);
  const [syllabusCreatorDetails, setSyllabusCreatorDetails] =
    useState<SyllabusCreatorDetails | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentAdditionalInfo, setCurrentAdditionalInfo] = useState("");

  // Fetch subjects
  const { data: subjectsData } = useQuery(
    ["subjects"],
    async () => {
      const response = await api({
        endpoint: {
          method: "GET",
          url: "/subjects",
          showToast: false,
          succesMsgHide: true,
        },
      });
      return response;
    },
    {
      enabled: true,
      refetchOnWindowFocus: false,
    }
  );

  // Fetch grades
  const { data: gradesData } = useQuery(
    ["grades"],
    async () => {
      const response = await api({
        endpoint: {
          method: "GET",
          url: "/grades",
          showToast: false,
          succesMsgHide: true,
        },
      });
      return response;
    },
    {
      enabled: true,
      refetchOnWindowFocus: false,
    }
  );

  const subjects = subjectsData?.data?.data || [];
  const grades = gradesData?.data?.data || [];

  // Find subject and grade names by ID
  const getSubjectNameById = (id: string) => {
    const subject = subjects.find((s: any) => s._id === id);
    return subject ? subject.title || subject.name : id;
  };

  const getGradeNameById = (id: string) => {
    const grade = grades.find((g: any) => g._id === id);
    return grade ? grade.title || grade.name : id;
  };

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseTitle: "",
      courseDescription: "",
      subjectId: "",
      gradeId: "",
      generationPrompt: "",
      additionalInformation: "",
      systemPrompt: "",
    },
  });

  // Handle form submission from the details tab
  async function onSubmitDetails(values: CourseFormValues) {
    setFormValues(values);

    // Adapt the form values to match the SyllabusCreator's expected props format
    const adaptedDetails: SyllabusCreatorDetails = {
      name: values.courseTitle,
      description: values.courseDescription,
      subject: getSubjectNameById(values.subjectId),
      gradeLevel: getGradeNameById(values.gradeId),
    };

    setSyllabusCreatorDetails(adaptedDetails);
    setActiveTab("syllabus");
  }

  // The SyllabusCreator component expects a callback with no arguments
  // This function will be called when the user clicks "Create Course" in the preview tab
  async function handleSyllabusComplete() {
    setShowSuccessDialog(true);

    return;
    if (!formValues) return;

    // Get the values from the SyllabusCreator component
    // In a real implementation, the SyllabusCreator would have a way to expose these values
    // For simplicity, you can provide an event emitter or other mechanism
    // Here we'll assume we've been capturing the values as the user interacts with the component
    const syllabusData = {
      prompt: currentPrompt,
      additionalInfo: currentAdditionalInfo,
      systemPrompt: "", // Or get this from a state variable if needed
    };

    setIsSubmitting(true);
    try {
      // Combine course details with syllabus data
      const courseData = {
        ...formValues,
        generationPrompt: syllabusData.prompt,
        additionalInformation: syllabusData.additionalInfo,
        systemPrompt: syllabusData.systemPrompt,
      };

      // Submit to API
      const response = await api({
        endpoint: COURSES_API.CREATE,
        payloadData: courseData,
      });

      if (!response.data.error) {
        toast({
          title: "Success",
          description: "Course created successfully",
        });

        // Show success dialog instead of immediate redirect
        setShowSuccessDialog(true);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Failed to create course",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle dialog close and navigation
  function handleDialogClose() {
    setShowSuccessDialog(false);
    router.push("/dashboard/courses");
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Create New Course"
        subheading="Set up your course details and create a syllabus with AI assistance"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="syllabus" disabled={!syllabusCreatorDetails}>
            Syllabus
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>
                Enter the basic details about your course. You'll create your
                syllabus in the next step.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitDetails)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="courseTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Introduction to Literature"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The name of your course as it will appear to students.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="subjectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects.length > 0 ? (
                                subjects.map((subject: any) => (
                                  <SelectItem
                                    key={subject._id}
                                    value={subject._id}
                                  >
                                    {subject.title}
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="english">
                                    English
                                  </SelectItem>
                                  <SelectItem value="math">
                                    Mathematics
                                  </SelectItem>
                                  <SelectItem value="science">
                                    Science
                                  </SelectItem>
                                  <SelectItem value="history">
                                    History
                                  </SelectItem>
                                  <SelectItem value="art">Art</SelectItem>
                                  <SelectItem value="music">Music</SelectItem>
                                  <SelectItem value="computerScience">
                                    Computer Science
                                  </SelectItem>
                                  <SelectItem value="foreignLanguage">
                                    Foreign Language
                                  </SelectItem>
                                  <SelectItem value="physicalEducation">
                                    Physical Education
                                  </SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gradeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a grade level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {grades.length > 0 ? (
                                grades.map((grade: any) => (
                                  <SelectItem key={grade._id} value={grade._id}>
                                    {grade.title}
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="elementary">
                                    Elementary School
                                  </SelectItem>
                                  <SelectItem value="middleSchool">
                                    Middle School
                                  </SelectItem>
                                  <SelectItem value="highSchool">
                                    High School
                                  </SelectItem>
                                  <SelectItem value="undergraduate">
                                    Undergraduate
                                  </SelectItem>
                                  <SelectItem value="graduate">
                                    Graduate
                                  </SelectItem>
                                  <SelectItem value="professional">
                                    Professional
                                  </SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="courseDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A brief description of what students will learn in this course..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This will help our AI generate a more relevant
                          syllabus.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full md:w-auto">
                    Continue to Syllabus
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="syllabus" className="mt-6">
          {syllabusCreatorDetails && (
            <SyllabusCreator
              courseDetails={syllabusCreatorDetails}
              onComplete={handleSyllabusComplete}
              isCreating={isSubmitting}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Course Creation Coming soon!</AlertDialogTitle>
            <AlertDialogDescription>
              Course creation functionality is currently under development.
              We're working hard to bring you an amazing course creation
              experience soon!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleDialogClose}>
              Go back to courses list
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
