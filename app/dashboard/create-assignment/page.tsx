"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, Edit, ArrowRight, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "react-query";
import { api } from "@/api";
import { ASSIGNMENTS_API } from "@/contants/api-url/assignments";
import { COURSES_API } from "@/contants/api-url/courses";
import { ASSIGNMENT_CATEGORIES_API } from "@/contants/api-url/assignment-categories";
import { checkSuccessResponse } from "@/utils/common";

// Type definitions
interface Course {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  title: string;
  systemPrompt?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: any;
}

export default function CreateAssignmentPage() {
  const { toast } = useToast();
  const router = useRouter();

  // Step tracking
  const [currentStep, setCurrentStep] = useState<"details" | "preview">(
    "details"
  );

  // Assignment data
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [assignmentCategoryId, setAssignmentCategoryId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [learningObjectivesDescription, setLearningObjectivesDescription] =
    useState("");

  // Integration options
  const [canvas, setCanvas] = useState(false);
  const [google, setGoogle] = useState(false);
  const [googleMeet, setGoogleMeet] = useState(false);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch courses
  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useQuery("courses", async () => {
    const response = await api({
      endpoint: COURSES_API.GET_ALL,
    });
    return response;
  });

  // Fetch assignment categories
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery("assignmentCategories", async () => {
    const response = await api({
      endpoint: ASSIGNMENT_CATEGORIES_API.GET_ALL,
    });
    return response;
  });

  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields
    if (!title || !assignmentCategoryId || !dueDate) {
      toast({
        title: "Missing required fields",
        description:
          "Please fill in all required fields: title, category, and due date",
        variant: "destructive",
      });
      return;
    }

    // If on details step, move to preview
    if (currentStep === "details") {
      setCurrentStep("preview");
      return;
    }

    // Otherwise, submit the assignment
    setIsSubmitting(true);

    try {
      const response = (await api({
        endpoint: ASSIGNMENTS_API.CREATE,
        payloadData: {
          title,
          courseId,
          assignmentCategoryId,
          dueDate,
          description,
          learningObjectivesDescription,
          canvas,
          google,
          googleMeet,
        },
      })) as ApiResponse;

      if (checkSuccessResponse(response)) {
        toast({
          title: "Success",
          description: "Assignment created successfully",
        });
        const newAssignmentId = response?.data?.data?._id; // Assuming the ID is in response.data._id
        if (newAssignmentId) {
          router.push(`/dashboard/assignments/${newAssignmentId}/edit`);
        } else {
          // Fallback if ID is not found in response
          console.error("Could not get new assignment ID from response");
          router.push("/dashboard/assignments");
        }
      } else {
        throw new Error(response?.message || "Failed to create assignment");
      }
    } catch (error: any) {
      console.error("Error creating assignment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the selected category data
  const selectedCategory = categoriesData?.data?.data?.find(
    (category: Category) => category._id === assignmentCategoryId
  );

  const goBack = () => {
    if (currentStep === "preview") {
      setCurrentStep("details");
    } else {
      router.push("/dashboard/assignments");
    }
  };

  // Render the details form
  const renderDetailsForm = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">
                Assignment Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter assignment title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="due-date"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">
                Assignment Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={assignmentCategoryId}
                onValueChange={(value) => setAssignmentCategoryId(value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCategories ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Loading categories...</span>
                    </div>
                  ) : categoriesError ? (
                    <div className="text-red-500 p-2">
                      Error loading categories
                    </div>
                  ) : Array.isArray(categoriesData?.data?.data) &&
                    categoriesData?.data?.data?.length > 0 ? (
                    categoriesData?.data?.data?.map((category: Category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.title}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2">No categories available</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Select
                value={courseId}
                onValueChange={(value) => setCourseId(value)}
              >
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCourses ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Loading courses...</span>
                    </div>
                  ) : coursesError ? (
                    <div className="text-red-500 p-2">
                      Error loading courses
                    </div>
                  ) : coursesData?.data?.data?.length > 0 ? (
                    coursesData?.data?.data.map((course: Course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2">No courses available</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Assignment Description</Label>
            <Textarea
              id="description"
              placeholder="Enter a detailed description of the assignment"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learning-objectives">Learning Objectives</Label>
            <Textarea
              id="learning-objectives"
              placeholder="Enter the learning objectives for this assignment"
              rows={3}
              value={learningObjectivesDescription}
              onChange={(e) => setLearningObjectivesDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Integration Options</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canvas"
                  checked={canvas}
                  onCheckedChange={(checked) => setCanvas(checked === true)}
                />
                <Label htmlFor="canvas" className="font-normal">
                  Canvas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="google"
                  checked={google}
                  onCheckedChange={(checked) => setGoogle(checked === true)}
                />
                <Label htmlFor="google" className="font-normal">
                  Google Classroom
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="google-meet"
                  checked={googleMeet}
                  onCheckedChange={(checked) => setGoogleMeet(checked === true)}
                />
                <Label htmlFor="google-meet" className="font-normal">
                  Google Meet
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={goBack}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Render the preview step
  const renderPreview = () => {
    const course = coursesData?.data?.data?.find(
      (course: Course) => course._id === courseId
    );
    const category = categoriesData?.data?.data?.find(
      (category: Category) => category._id === assignmentCategoryId
    );

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">
                Assignment Title
              </p>
              <p className="text-lg font-medium">{title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Due Date</p>
              <p className="text-lg font-medium">
                {new Date(dueDate).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Course</p>
              <p className="text-lg font-medium">
                {course?.name || "Not specified"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Category</p>
              <p className="text-lg font-medium">
                {category?.title || "Unknown"}
              </p>
            </div>
          </div>

          {description && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Description</p>
              <div className="rounded-md bg-gray-50 p-3">
                <p className="whitespace-pre-wrap">{description}</p>
              </div>
            </div>
          )}

          {learningObjectivesDescription && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">
                Learning Objectives
              </p>
              <div className="rounded-md bg-gray-50 p-3">
                <p className="whitespace-pre-wrap">
                  {learningObjectivesDescription}
                </p>
              </div>
            </div>
          )}

          {(canvas || google || googleMeet) && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Integration</p>
              <div className="flex flex-wrap gap-2">
                {canvas && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                    Canvas
                  </span>
                )}
                {google && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                    Google Classroom
                  </span>
                )}
                {googleMeet && (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800">
                    Google Meet
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={goBack}>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Assignment
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Assignment</h2>
      </div>

      <div className="mb-8">
        <div className="overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-2 w-1/2 rounded-full bg-primary transition-all duration-500"
            style={{ width: currentStep === "details" ? "50%" : "100%" }}
          ></div>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="font-medium">Assignment Details</span>
          <span
            className={`${
              currentStep === "preview" ? "font-medium" : "text-gray-500"
            }`}
          >
            Review & Create
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === "details"
              ? "Assignment Details"
              : "Review Assignment"}
          </CardTitle>
          <CardDescription>
            {currentStep === "details"
              ? "Fill in the details of your new assignment"
              : "Review your assignment before creating it"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === "details" ? renderDetailsForm() : renderPreview()}
        </CardContent>
      </Card>
    </div>
  );
}
