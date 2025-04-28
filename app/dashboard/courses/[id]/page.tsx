"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  Plus,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { api } from "@/api";
import { Badge } from "@/components/ui/badge";

// Type definitions based on actual backend Course model
interface Course {
  _id: string;
  courseTitle: string;
  subjectId: {
    _id: string;
    name: string;
  };
  gradeId: {
    _id: string;
    name: string;
  };
  courseDescription: string;
  generationPrompt: string;
  additionalInformation?: string;
  systemPrompt: string;
  userId: string;
}

export default function CourseDetailPage() {
  const { toast } = useToast();
  const params = useParams();
  const courseId = params.id as string;

  const [activeTab, setActiveTab] = useState("details");
  const [isDownloadingSyllabus, setIsDownloadingSyllabus] = useState(false);

  // State for API data
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        // API call to get course details - only API that exists in backend
        const courseResponse = await api({
          endpoint: {
            method: "GET",
            url: `/courses/${courseId}`,
            showToast: false,
          },
        });

        if (courseResponse.data.error)
          throw new Error("Failed to fetch course data");
        setCourse(courseResponse.data.data);
      } catch (error) {
        console.error("Error fetching course data:", error);
        toast({
          title: "Error",
          description: "Failed to load course data. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, toast]);

  const handleDownloadSyllabusPDF = () => {
    setIsDownloadingSyllabus(true);

    // Simulate PDF download
    setTimeout(() => {
      setIsDownloadingSyllabus(false);

      toast({
        title: "Syllabus Downloaded",
        description: "Your syllabus has been downloaded as a PDF",
      });

      // In a real app, this would trigger a PDF download
    }, 2000);
  };

  if (isLoading || !course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading course data...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {course.courseTitle}
        </h2>
        <Badge>
          {course.subjectId.name} - {course.gradeId.name}
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>
                  {course.courseTitle} - {course.subjectId.name}
                </CardDescription>
              </div>
              {/* <Button asChild>
                <Link href={`/dashboard/courses/edit/${courseId}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Edit Course
                </Link>
              </Button> */}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="details"
              className="space-y-4"
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
                <TabsTrigger value="prompts">AI Prompts</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                    <CardDescription>
                      Basic information about this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Title</h3>
                        <p>{course.courseTitle}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Subject</h3>
                        <p>{course.subjectId.name}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Grade Level</h3>
                        <p>{course.gradeId.name}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Description</h3>
                        <p>{course.courseDescription}</p>
                      </div>
                      {course.additionalInformation && (
                        <div>
                          <h3 className="text-lg font-medium">
                            Additional Information
                          </h3>
                          <p>{course.additionalInformation}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="syllabus" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Course Syllabus</CardTitle>
                        <CardDescription>
                          Review and edit your course syllabus
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={handleDownloadSyllabusPDF}
                          disabled={isDownloadingSyllabus}
                        >
                          {isDownloadingSyllabus ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </>
                          )}
                        </Button>
                        <Button asChild>
                          <Link
                            href={`/dashboard/courses/syllabus/${courseId}`}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Edit Syllabus
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none dark:prose-invert">
                      <h1>
                        {course.courseTitle} ({course.subjectId.name})
                      </h1>
                      <h2>{course.gradeId.name}</h2>

                      <h3>Course Description</h3>
                      <p>{course.courseDescription}</p>

                      {course.additionalInformation && (
                        <>
                          <h3>Additional Information</h3>
                          <p>{course.additionalInformation}</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prompts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>AI Generation Prompts</CardTitle>
                        <CardDescription>
                          Prompts used for AI-powered content generation
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Generation Prompt
                        </h3>
                        <div className="bg-muted p-4 rounded-md overflow-auto max-h-[200px]">
                          <pre className="text-sm whitespace-pre-wrap">
                            {course.generationPrompt}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          System Prompt
                        </h3>
                        <div className="bg-muted p-4 rounded-md overflow-auto max-h-[200px]">
                          <pre className="text-sm whitespace-pre-wrap">
                            {course.systemPrompt}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        {/* <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" asChild>
              <Link href={`/dashboard/courses/edit/${courseId}`}>
                <FileText className="mr-2 h-4 w-4" />
                Edit Course
              </Link>
            </Button>
            <Button className="w-full justify-start" asChild>
              <Link
                href={`/dashboard/courses/assignments/create?courseId=${courseId}`}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Link>
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleDownloadSyllabusPDF}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Syllabus
            </Button>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
