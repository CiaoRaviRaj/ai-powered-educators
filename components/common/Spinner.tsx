"use client";
import { Loader2 } from "lucide-react";
import React from "react";

function Spinner() {
  return (
    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
  );
}

export default Spinner;
