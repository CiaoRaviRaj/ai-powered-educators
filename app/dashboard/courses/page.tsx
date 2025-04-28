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
import { BookOpen, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "react-query";
import { api, paramsType } from "@/api";
import { COURSES_API } from "@/contants/api-url/courses";
import { checkSuccessResponse } from "@/utils/common";

interface Course {
  _id: string;
  courseTitle: string;
  courseDescription?: string;
  subjectId?: {
    name: string;
    _id: string;
  };
  gradeId?: {
    name: string;
    _id: string;
  };
}

export default function CoursesPage() {
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch courses using useQuery
  const { data, isLoading, error, refetch } = useQuery(
    ["courses", searchQuery],
    async () => {
      const searchParams: paramsType = searchQuery
        ? { search: inputValue }
        : {};
      const response = await api({
        endpoint: COURSES_API.GET_ALL,
        params: searchParams,
      });
      return response;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  // Extract courses from the query response
  const courses = data?.data?.data || [];

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
          <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
          <div className="flex items-center space-x-2">
            <Link href="/dashboard/courses/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Course
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
          <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
          <div className="flex items-center space-x-2">
            <Link href="/dashboard/courses/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error loading courses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/courses/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="w-[200px] pl-8 md:w-[300px]"
            value={inputValue}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* COURSES LIST */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.length > 0 ? (
          courses.map((course: Course) => (
            <Card key={course._id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>{course.courseTitle}</CardTitle>
                  <CardDescription>
                    {course.subjectId?.name || "No subject"} -{" "}
                    {course.gradeId?.name || "No grade"}
                  </CardDescription>
                </div>
                <Badge>Active</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <BookOpen className="mr-1 h-4 w-4" />
                    <span className="line-clamp-2">
                      {course.courseDescription || "No description"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/dashboard/courses/${course._id}`}
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
            <p className="text-muted-foreground">No courses found</p>
          </div>
        )}
      </div>
    </div>
  );
}
