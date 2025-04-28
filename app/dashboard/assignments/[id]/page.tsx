"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Share2, Edit } from "lucide-react";
import Link from "next/link";
import { FileUpload } from "@/components/file-upload";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { api } from "@/api";
import { ASSIGNMENTS_API } from "@/contants/api-url/assignments";
import { checkSuccessResponse } from "@/utils/common";

// Define interfaces
interface Submission {
  _id?: string; // Add _id for MongoDB documents
  id: string;
  studentName: string | null;
  studentId: string;
  submissionDate: string;
  status: "graded" | "pending";
  score: number | null;
  aiScore: number;
  plagiarismScore: number;
}

interface AssignmentData {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  courseId?: any;
  assignmentCategoryId?: any;
  learningObjectivesDescription?: string;
  canvas?: boolean;
  google?: boolean;
  googleMeet?: boolean;
  systemPrompt?: string;
  totalPoints: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  submissions: Submission[];
}

export default function AssignmentDetailPage({}: {}) {
  const router = useRouter();
  const params = useParams();
  const { id: assignmentId } = params; // Get assignmentId from params
  const [assignNameOpen, setAssignNameOpen] = useState(false);
  // Use the Submission type here
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [manualStudentName, setManualStudentName] = useState("");
  const [activeTab, setActiveTab] = useState("select");
  const { toast } = useToast();

  // State for fetched assignment data, loading, and error
  const [assignmentData, setAssignmentData] = useState<AssignmentData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for formatted dates
  const [formattedDueDate, setFormattedDueDate] = useState("");
  const [formattedSubmissionDates, setFormattedSubmissionDates] = useState<{
    [key: string]: string;
  }>({});

  // useEffect to fetch assignment details
  useEffect(() => {
    if (!assignmentId) {
      setError("Assignment ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchAssignmentDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Make sure your API base URL is configured correctly,
        // or use a relative path if the API is served from the same origin
        const response = await api({
          endpoint: ASSIGNMENTS_API.GET_BY_ID,
          id: assignmentId as string,
        });
        if (checkSuccessResponse(response)) {
          // Actual assignment data is in response.data.data
          const fetchedData = response.data.data;

          // Add mock submissions if needed - since API doesn't return submissions yet
          if (!fetchedData.submissions) {
            fetchedData.submissions = [];
          }

          setAssignmentData(fetchedData);
        } else {
          setError(
            "Failed to fetch assignment details: Invalid response format."
          );
        }
      } catch (err: unknown) {
        console.error("Error fetching assignment:", err);
        setError(
          (err as any)?.response?.data?.message ||
            (err as Error)?.message ||
            "An unexpected error occurred while fetching assignment details."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignmentDetails();
  }, [assignmentId]); // Re-run effect if assignmentId changes

  // useEffect to format dates on the client side after data is fetched
  useEffect(() => {
    // Format due date
    if (assignmentData?.dueDate) {
      setFormattedDueDate(
        new Date(assignmentData.dueDate).toLocaleDateString()
      );
    }

    // Format submission dates
    if (assignmentData?.submissions) {
      const formattedDates: { [key: string]: string } = {};
      assignmentData.submissions.forEach((sub) => {
        // Use sub._id if available, otherwise use sub.id
        const subId = sub._id || sub.id;
        if (sub?.submissionDate && subId) {
          formattedDates[subId] = new Date(
            sub.submissionDate
          ).toLocaleDateString();
        }
      });
      setFormattedSubmissionDates(formattedDates);
    }
    // Depend on assignmentData to re-run formatting when data changes
  }, [assignmentData]);

  const handleUploadComplete = (files: File[], images: string[]) => {
    console.log("Files uploaded:", files);
    console.log("Images captured:", images);
    // TODO: Implement actual upload logic and update assignmentData.submissions
    toast({
      title: "Info",
      description: "File upload handling not yet implemented.",
    });
  };

  const handleEditAssignment = () => {
    if (!assignmentId) return;
    router.push(`/dashboard/assignments/${assignmentId}/edit`);
  };

  const handleAssignName = async () => {
    // Make async if you need to call API
    const studentName =
      activeTab === "select" ? selectedStudent : manualStudentName;
    const submissionId = selectedSubmission?._id || selectedSubmission?.id;

    if (!studentName) {
      toast({
        title: "Error",
        description: "Please select or enter a student name",
        variant: "destructive",
      });
      return;
    }
    if (!selectedSubmission || !submissionId) {
      toast({
        title: "Error",
        description: "No submission selected.",
        variant: "destructive",
      });
      return;
    }

    // --- TODO: API Call to update submission ---
    // For now, just show success toast (replace with actual API call)
    toast({
      title: "Success (Placeholder)",
      description: `Submission assigned to ${studentName}. (API call needed)`,
    });
    // OPTIMISTIC UPDATE (Remove if you implement API call above with state update)
    setAssignmentData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        submissions: prevData.submissions.map((sub) =>
          (sub._id || sub.id) === submissionId ? { ...sub, studentName } : sub
        ),
      };
    });

    setAssignNameOpen(false);
    setSelectedSubmission(null);
    setSelectedStudent("");
    setManualStudentName("");
  };

  // Use the Submission type for the parameter
  const openAssignNameDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    // Reset state for the dialog
    setSelectedStudent("");
    setManualStudentName("");
    setActiveTab("select"); // Reset to select tab
    setAssignNameOpen(true);
  };

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6 flex justify-center items-center h-screen">
        {/* Add a spinner or loading text */}
        <p>Loading assignment details...</p>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-6 text-red-600">
        <h1 className="text-2xl font-bold">Error</h1>
        <p>{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // --- Render No Data State ---
  if (!assignmentData) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <p>Assignment not found.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // --- Render Assignment Details ---
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {/* Use fetched data */}
            {assignmentData.title}
          </h1>
          <p className="text-muted-foreground">
            {/* Use the state variable for the formatted due date */}
            Due: {formattedDueDate || "..."}{" "}
            {/* Show placeholder while loading */}
          </p>
        </div>
        <div className="flex gap-2">
          <FileUpload
            trigger={<Button>Submit Assignment</Button>}
            title="Submit Assignment"
            description="Upload your completed assignment. You can upload files or take photos."
            onUploadComplete={handleUploadComplete}
          />
          <Button variant="outline" onClick={handleEditAssignment}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Assignment
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Use fetched data */}
          <p>{assignmentData.description}</p>
          <p className="mt-2">
            {/* Use fetched data - ensure totalPoints exists */}
            <strong>Total Points:</strong> {assignmentData.totalPoints ?? "N/A"}
          </p>
          {assignmentData.learningObjectivesDescription && (
            <p className="mt-2">
              <strong>Learning Objectives:</strong>{" "}
              {assignmentData.learningObjectivesDescription}
            </p>
          )}
          {assignmentData.courseId && (
            <p className="mt-2">
              <strong>Course:</strong> {assignmentData.courseId.courseTitle}
            </p>
          )}
          {assignmentData.assignmentCategoryId && (
            <p className="mt-2">
              <strong>Assignment Type:</strong>{" "}
              {assignmentData.assignmentCategoryId.title}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          {/* Use fetched data */}
          <CardDescription>
            {assignmentData.submissions?.length ?? 0} submissions received
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Use fetched data */}
            {assignmentData.submissions &&
            assignmentData.submissions.length > 0 ? (
              assignmentData.submissions.map((submission) => {
                // Adjust key based on actual ID field (_id or id)
                const submissionId = submission._id || submission.id;
                const submissionKey = `sub-${submissionId}`;
                return (
                  <div
                    key={submissionKey}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={`/placeholder.svg?height=40&width=40`}
                        />
                        <AvatarFallback>
                          {submission.studentName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {submission.studentName ? (
                          <p className="font-medium">
                            {submission.studentName}
                          </p>
                        ) : (
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-blue-500"
                            onClick={() => openAssignNameDialog(submission)}
                          >
                            Assign Student Name
                          </Button>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {/* Use the state variable for the formatted submission date */}
                          Submitted:{" "}
                          {formattedSubmissionDates[submissionId] || "..."}{" "}
                          {/* Show placeholder */}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.status === "graded" ? (
                        <Badge className="bg-green-500">
                          {/* Ensure score exists */}
                          {submission.score ?? "N/A"}/
                          {assignmentData.totalPoints ?? 100}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                      <div className="flex gap-2">
                        {/* Update links to use the correct assignmentId and submissionId */}
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          title="Share"
                        >
                          <Link
                            href={`/dashboard/assignments/${assignmentId}/submissions/${submissionId}/share`}
                          >
                            <Share2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          title="Download"
                        >
                          {/* TODO: Link to actual download endpoint */}
                          <Link
                            href={`/api/submissions/${submissionId}/download`} // Example endpoint
                            target="_blank" // Optional: Open in new tab
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          title="Review"
                        >
                          <Link
                            href={`/dashboard/assignments/${assignmentId}/submissions/${submissionId}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground">
                No submissions received yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assign Name Dialog (ensure student list is dynamic or fetched if needed) */}
      <Dialog open={assignNameOpen} onOpenChange={setAssignNameOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Student Name</DialogTitle>
            <DialogDescription>
              This submission ({selectedSubmission?.studentId}) doesn't have a
              student name. Please assign a student to it.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select">Select Student</TabsTrigger>
              <TabsTrigger value="manual">Enter Manually</TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="student-select">Select from class roster</Label>
                <Select
                  value={selectedStudent}
                  onValueChange={setSelectedStudent}
                >
                  <SelectTrigger id="student-select">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Populate this from your actual student list/API */}
                    <SelectItem value="John Doe">John Doe</SelectItem>
                    <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                    <SelectItem value="Alex Johnson">Alex Johnson</SelectItem>
                    <SelectItem value="Sam Wilson">Sam Wilson</SelectItem>
                    <SelectItem value="Taylor Brown">Taylor Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Enter student name</Label>
                <Input
                  id="student-name"
                  value={manualStudentName}
                  onChange={(e) => setManualStudentName(e.target.value)}
                  placeholder="e.g., John Doe"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            {/* TODO: Disable button while assigning name API call is in progress */}
            <Button onClick={handleAssignName}>Assign Name</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
