"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Save,
  ArrowLeft,
  Copy,
  Check,
  Edit as EditIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { api, ApiResponse } from "@/api";
import { ASSIGNMENTS_API } from "@/contants/api-url/assignments";
import { COURSES_API } from "@/contants/api-url/courses";
import { ASSIGNMENT_CATEGORIES_API } from "@/contants/api-url/assignment-categories";
import { checkSuccessResponse } from "@/utils/common";
import { format } from "date-fns";

// Type definitions
interface Course {
  _id: string;
  courseTitle: string;
}

interface SubCategory {
  _id: string;
  title: string; // e.g., "instructions", "rubric"
  systemPrompt?: string;
}

interface Category {
  _id: string;
  title: string;
  assignmentSubCategoryIds: SubCategory[];
}

interface Assignment {
  _id: string;
  title: string;
  courseId?: string | Course; // Can be string ID or populated Course object
  assignmentCategoryId: string | Category; // Can be string ID or populated Category object
  dueDate: string;
  description?: string;
  learningObjectivesDescription?: string;
  canvas?: boolean;
  google?: boolean;
  googleMeet?: boolean;
  systemPrompt?: string; // This will be a JSON string
}

interface GeneratedContent {
  [key: string]: string;
}

interface ApiParams {
  endpoint: EndpointConfig;
  payloadData?: any;
  params?: any; // For query params
  pathParams?: { [key: string]: string | number }; // Add pathParams here
}

interface EndpointConfig {
  // Assuming this structure based on usage
  method: string;
  url: string;
  showToast?: boolean;
  succesMsgHide?: boolean;
}

export default function EditAssignmentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;
  const queryClient = useQueryClient();

  // States for form fields
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState<string | undefined>(undefined);
  const [assignmentCategoryId, setAssignmentCategoryId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [learningObjectivesDescription, setLearningObjectivesDescription] =
    useState("");
  const [canvas, setCanvas] = useState(false);
  const [google, setGoogle] = useState(false);
  const [googleMeet, setGoogleMeet] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>(
    {}
  );
  const [initialSystemPrompt, setInitialSystemPrompt] = useState<
    string | undefined
  >(undefined);

  // Copy state
  const [copied, setCopied] = useState<string | null>(null);

  // Fetch Assignment Data
  const {
    data: assignmentData,
    isLoading: isLoadingAssignment,
    error: assignmentError,
    isSuccess: isAssignmentSuccess,
  } = useQuery<Assignment, Error>(
    ["assignment", assignmentId],
    async () => {
      // Construct the URL with the ID directly
      const endpointConfig = {
        ...ASSIGNMENTS_API.GET_BY_ID,
      };
      const response = await api({
        endpoint: ASSIGNMENTS_API.GET_BY_ID,
        id: assignmentId,
      });

      if (!checkSuccessResponse(response)) {
        // Add optional chaining for safety
        throw new Error(
          response?.data?.message || "Failed to fetch assignment"
        );
      }
      // Return just the Assignment data, not the whole response
      return response.data.data;
    },
    {
      enabled: !!assignmentId,
      onError: (error: Error) => {
        // Use Error type
        toast({
          title: "Error fetching assignment",
          description: error.message,
          variant: "destructive",
        });
        router.push("/dashboard/assignments");
      },
    }
  );

  // Fetch Courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery<
    Course[],
    Error
  >("courses", async () => {
    const response = await api({ endpoint: COURSES_API.GET_ALL });

    if (!checkSuccessResponse(response)) {
      // Add optional chaining
      throw new Error(response?.data?.message || "Failed to fetch courses");
    }

    // Return just the Course data array
    return response.data.data;
  });

  // Fetch Assignment Categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<
    Category[],
    Error
  >("assignmentCategories", async () => {
    const response = await api({
      endpoint: ASSIGNMENT_CATEGORIES_API.GET_ALL,
    });
    // Assert the structure carefully
    if (!checkSuccessResponse(response)) {
      // Add optional chaining
      throw new Error(response?.data?.message || "Failed to fetch categories");
    }
    // Return just the Category data array
    return response.data.data;
  });

  // Effect to populate form when assignment data loads
  useEffect(() => {
    if (assignmentData) {
      setTitle(assignmentData.title || "");
      // Handle potential object/string ID difference
      const cId =
        typeof assignmentData.courseId === "object" &&
        assignmentData.courseId !== null
          ? assignmentData.courseId._id
          : assignmentData.courseId;
      setCourseId(cId || undefined); // Set to undefined if null/empty
      const catId =
        typeof assignmentData.assignmentCategoryId === "object"
          ? assignmentData.assignmentCategoryId._id
          : assignmentData.assignmentCategoryId;
      setAssignmentCategoryId(catId || "");
      // Format date for datetime-local input
      try {
        setDueDate(
          assignmentData.dueDate
            ? format(new Date(assignmentData.dueDate), "yyyy-MM-dd'T'HH:mm")
            : ""
        );
      } catch (e) {
        console.error("Error formatting date:", e);
        setDueDate(""); // Fallback
      }
      setDescription(assignmentData.description || "");
      setLearningObjectivesDescription(
        assignmentData.learningObjectivesDescription || ""
      );
      setCanvas(assignmentData.canvas || false);
      setGoogle(assignmentData.google || false);
      setGoogleMeet(assignmentData.googleMeet || false);
      setInitialSystemPrompt(assignmentData.systemPrompt);

      // Parse systemPrompt JSON string
      if (assignmentData.systemPrompt) {
        try {
          const parsedContent = JSON.parse(assignmentData.systemPrompt);
          // Process each content field to replace escaped newlines
          Object.keys(parsedContent).forEach((key) => {
            if (typeof parsedContent[key] === "string") {
              parsedContent[key] = parsedContent[key].replace(/\\n/g, "\n");
            }
          });
          setGeneratedContent(parsedContent);
        } catch (error) {
          console.error("Error parsing systemPrompt:", error);
          toast({
            title: "Error parsing generated content",
            description:
              "The existing generated content could not be loaded for editing.",
            variant: "destructive",
          });
          setGeneratedContent({}); // Reset to empty object on parse error
        }
      } else {
        setGeneratedContent({}); // Initialize if no prompt exists
      }
    }
  }, [assignmentData, toast]);

  // Find the current category object to get sub-category info
  const currentCategory = categories?.find(
    (cat) => cat._id === assignmentCategoryId
  );
  // Ensure subCategoryIds exists and is an array before mapping
  const subCategoryTypes = Array.isArray(
    currentCategory?.assignmentSubCategoryIds
  )
    ? currentCategory.assignmentSubCategoryIds.map((sub) =>
        sub.title.toLowerCase()
      )
    : [];
  const defaultTab =
    subCategoryTypes.length > 0 ? subCategoryTypes[0] : undefined;

  // Update Mutation
  const mutation = useMutation<Assignment, Error, Partial<Assignment>>(
    async (updatedAssignment: Partial<Assignment>) => {
      // Construct the URL with the ID directly
      const endpointConfig = {
        ...ASSIGNMENTS_API.UPDATE,
        url: `${ASSIGNMENTS_API.UPDATE.url}${assignmentId}`,
      };
      const response = await api({
        endpoint: endpointConfig,
        payloadData: updatedAssignment,
      });

      if (!checkSuccessResponse(response)) {
        throw new Error(
          response?.data?.message || "Failed to update assignment"
        );
      }

      // Return just the updated Assignment data
      return response.data.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["assignment", assignmentId]);
        queryClient.invalidateQueries("assignments");
        toast({
          title: "Success",
          description: "Assignment updated successfully",
        });
        router.push("/dashboard/assignments");
      },
      onError: (error: Error) => {
        // Use Error type
        toast({
          title: "Error updating assignment",
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  const handleUpdate = () => {
    if (!title || !assignmentCategoryId || !dueDate) {
      toast({
        title: "Missing required fields",
        description: "Title, category, and due date are required.",
        variant: "destructive",
      });
      return;
    }

    let systemPromptString = initialSystemPrompt;
    try {
      // Only stringify if generatedContent has keys
      if (Object.keys(generatedContent).length > 0) {
        systemPromptString = JSON.stringify(generatedContent);
      } else {
        // If user cleared all content, save null or empty string based on backend expectation
        systemPromptString = undefined; // Or perhaps "{}" if backend expects a JSON string
      }
    } catch (error) {
      console.error("Error stringifying generated content:", error);
      toast({
        title: "Error Saving Content",
        description: "Could not save the generated content changes.",
        variant: "destructive",
      });
      return; // Prevent submission if stringify fails
    }

    const updatedAssignment: Partial<Assignment> = {
      // Use the state variables directly
      title,
      courseId: courseId || undefined,
      assignmentCategoryId,
      dueDate,
      description,
      learningObjectivesDescription,
      canvas,
      google,
      googleMeet,
      systemPrompt: systemPromptString,
    };

    mutation.mutate(updatedAssignment);
  };

  // Handle content change in Textarea
  const handleContentChange = (key: string, value: string) => {
    setGeneratedContent((prev) => ({ ...prev, [key]: value }));
  };

  // Handle copying content to clipboard
  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: `Copied ${type}` });
  };

  // --- Loading and Error States ---
  if (isLoadingAssignment || isLoadingCourses || isLoadingCategories) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (assignmentError) {
    return (
      <div className="p-8 text-red-500">
        Error loading assignment data. You might be redirected shortly.
      </div>
    );
  }

  if (!assignmentData) {
    return <div className="p-8">Assignment not found.</div>;
  }

  // --- Render Logic ---
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Assignment</h2>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/assignments")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assignments
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>
            Modify the assignment details and generated content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* --- Basic Details Form --- */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">
                Assignment Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
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
                  {categories && categories.length > 0 ? (
                    categories.map((category: Category) => (
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
                value={courseId || "none"}
                onValueChange={(value) =>
                  setCourseId(value === "none" ? undefined : value)
                }
              >
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select a course (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- No Course --</SelectItem>
                  {courses && courses.length > 0 ? (
                    courses.map((course: Course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course?.courseTitle}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learning-objectives">Learning Objectives</Label>
            <Textarea
              id="learning-objectives"
              value={learningObjectivesDescription}
              onChange={(e) => setLearningObjectivesDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* --- Integration Options --- */}
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

          {/* --- Generated Content Tabs --- */}
          {subCategoryTypes.length > 0 && defaultTab && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Generated Content</h3>
              <Tabs defaultValue={defaultTab} className="space-y-4">
                <TabsList>
                  {subCategoryTypes.map((type) => (
                    <TabsTrigger key={type} value={type} className="capitalize">
                      {type.replace("_", " ")}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {subCategoryTypes.map((type) => (
                  <TabsContent key={type} value={type} className="mt-2">
                    <div className="flex justify-end space-x-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCopyToClipboard(
                            generatedContent[type] || "",
                            type
                          )
                        }
                        className="h-8"
                      >
                        {copied === type ? (
                          <Check className="mr-1 h-4 w-4" />
                        ) : (
                          <Copy className="mr-1 h-4 w-4" />
                        )}
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={generatedContent[type] || ""}
                      onChange={(e) =>
                        handleContentChange(type, e.target.value)
                      }
                      placeholder={`Enter ${type.replace(
                        "_",
                        " "
                      )} content here...`}
                      className="min-h-[400px] font-mono text-sm"
                      aria-label={`${type} content`}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}

          {/* --- Save Button --- */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleUpdate} disabled={mutation.isLoading}>
              {mutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
