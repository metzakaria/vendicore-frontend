"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { updateFundingRequest } from "../../_actions/updateFundingRequest";

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  description: z.string().min(2, "Description must be at least 2 characters."),
  source: z.string().min(2, "Source must be at least 2 characters."),
  is_approved: z.boolean(),
});

interface EditFundingFormProps {
  funding: any;
}

export const EditFundingForm = ({ funding }: EditFundingFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: Number(funding.amount) || 0,
      description: funding.description || "",
      source: funding.source || "",
      is_approved: funding.is_approved || false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    const result = await updateFundingRequest(funding.funding_ref, values);

    setIsLoading(false);

    if (result.success) {
      router.push(`/admin/funding/${funding.funding_ref}`);
    } else {
      setError(result.error || "An unexpected error occurred.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Funding Request</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_approved"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Approved</FormLabel>
                    <FormDescription>
                      Is this funding request approved?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
