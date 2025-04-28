"use client";
import Link from "next/link";
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
import { CalendarDays, Clock, FileText, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "react-query";
import { api, paramsType } from "@/api";
import { ASSIGNMENTS_API } from "@/contants/api-url/assignments";
import { checkSuccessResponse } from "@/utils/common";

interface Assignment {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  courseId?: {
    name: string;
    _id: string;
  };
  status?: string;
  submissions?: number;
}

export default function AssignmentsPage() {
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch assignments using useQuery
  const { data, isLoading, error, refetch } = useQuery(
    ["assignments", searchQuery],
    async () => {
      const searchParams: paramsType = searchQuery
        ? { search: inputValue }
        : {};
      const response = await api({
        endpoint: ASSIGNMENTS_API.GET_ALL,
        params: searchParams,
      });
      return response;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  // Extract assignments from the query response
  const assignments = data?.data?.data || [];

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for debounce
    searchTimeout.current = setTimeout(() => {
      setSearchQuery(value);
    }, 500);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
          <div className="flex items-center space-x-2">
            <Link href="/dashboard/create-assignment">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
          <div className="flex items-center space-x-2">
            <Link href="/dashboard/create-assignment">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error loading assignments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/create-assignment">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search assignments..."
            className="w-[200px] pl-8 md:w-[300px]"
            value={inputValue}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* ASSIGNMENT LIST */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assignments.length > 0 ? (
          assignments.map((assignment: Assignment) => (
            <Card key={assignment._id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>{assignment.title}</CardTitle>
                  <CardDescription>
                    {assignment.courseId?.name || "No course"}
                  </CardDescription>
                </div>
                <Badge>{assignment.status || "Active"}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarDays className="mr-1 h-4 w-4" />
                    <span>
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    <FileText className="mr-1 h-4 w-4" />
                    <span>{assignment.submissions || 0} submissions</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/dashboard/assignments/${assignment._id}`}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No assignments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
