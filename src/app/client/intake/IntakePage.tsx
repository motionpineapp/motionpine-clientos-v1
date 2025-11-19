import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
export function IntakePage() {
  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col">
      <PageHeader
        title="New Project Intake"
        description="Submit a request for a new project or campaign."
        className="flex-none"
      />
      <Alert className="bg-blue-50 border-blue-100 text-blue-800 flex-none">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle>Before you start</AlertTitle>
        <AlertDescription>
          Please provide as much detail as possible about your project requirements. 
          Our team will review your submission within 24 hours.
        </AlertDescription>
      </Alert>
      <Card className="flex-1 border-gray-100 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0 h-full">
          {/* Mock Embed - In a real app, this would be a Typeform, ClickUp form, or custom form */}
          <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-center p-8">
            <div className="max-w-md space-y-6">
              <div className="h-16 w-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Intake Form Placeholder</h3>
                <p className="text-muted-foreground mt-2">
                  This area is reserved for an embedded form (e.g., ClickUp, Typeform, Airtable).
                  For this demo, imagine a beautiful multi-step form here.
                </p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-gray-200 text-left space-y-4 shadow-sm">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                  <div className="h-10 w-full bg-gray-50 rounded border border-gray-200" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-100 rounded" />
                  <div className="h-24 w-full bg-gray-50 rounded border border-gray-200" />
                </div>
                <div className="h-10 w-full bg-primary/10 rounded border border-primary/20 flex items-center justify-center text-primary font-medium">
                  Submit Request
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}