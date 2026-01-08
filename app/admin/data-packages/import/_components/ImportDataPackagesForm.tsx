"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getProductsForDropdown } from "../../_actions/getProductsForDropdown";
import { bulkImportDataPackages } from "../../_actions/bulkImportDataPackages";

interface ParsedRow {
  data_code: string;
  tariff_id?: string;
  amount: string;
  description: string;
  duration: string;
  value: string;
  product_id: string;
  is_active: boolean;
  errors?: string[];
}

export const ImportDataPackagesForm = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch products for validation
  const { data: products } = useQuery({
    queryKey: ["products-dropdown"],
    queryFn: () => getProductsForDropdown(),
    staleTime: 300000,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedData([]);
      setError(null);
      setSuccess(null);
    }
  };

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error("CSV file must have at least a header row and one data row");
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredHeaders = ["data_code", "amount", "description", "duration", "value", "product_id"];
    
    // Check for required headers
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
    }

    const rows: ParsedRow[] = [];
    const productMap = new Map(products?.map((p) => [p.id, p]) || []);

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row: ParsedRow = {
        data_code: values[headers.indexOf("data_code")] || "",
        tariff_id: headers.includes("tariff_id") ? values[headers.indexOf("tariff_id")] : "",
        amount: values[headers.indexOf("amount")] || "",
        description: values[headers.indexOf("description")] || "",
        duration: values[headers.indexOf("duration")] || "",
        value: values[headers.indexOf("value")] || "",
        product_id: values[headers.indexOf("product_id")] || "",
        is_active: headers.includes("is_active")
          ? values[headers.indexOf("is_active")]?.toLowerCase() === "true"
          : true,
        errors: [],
      };

      // Validate row
      if (!row.data_code) row.errors?.push("Data code is required");
      if (!row.amount || isNaN(Number(row.amount))) row.errors?.push("Valid amount is required");
      if (!row.description) row.errors?.push("Description is required");
      if (!row.duration) row.errors?.push("Duration is required");
      if (!row.value) row.errors?.push("Value is required");
      if (!row.product_id || !productMap.has(row.product_id)) {
        row.errors?.push("Valid product ID is required");
      }

      rows.push(row);
    }

    return rows;
  };

  const handlePreview = async () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setParsedData(parsed);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : String(err)) || "Failed to parse CSV file");
      setParsedData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      setError("No data to import. Please preview the file first.");
      return;
    }

    const rowsWithErrors = parsedData.filter((row) => row.errors && row.errors.length > 0);
    if (rowsWithErrors.length > 0) {
      setError(`Cannot import: ${rowsWithErrors.length} row(s) have errors. Please fix them first.`);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await bulkImportDataPackages(validRows);
      
      if (result.success) {
        const message = `Successfully imported ${result.results.success} package(s)`;
        if (result.results.failed > 0) {
          setError(`${message}. ${result.results.failed} failed. ${result.results.errors.slice(0, 5).join("; ")}`);
        } else {
          setSuccess(message);
        }
        setTimeout(() => {
          router.push("/admin/data-packages");
        }, 2000);
      } else {
        setError(result.error || "Failed to import data packages");
      }
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : String(err)) || "Failed to import data packages");
    } finally {
      setIsProcessing(false);
    }
  };

  const validRows = parsedData.filter((row) => !row.errors || row.errors.length === 0);
  const invalidRows = parsedData.filter((row) => row.errors && row.errors.length > 0);

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/data-packages")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Data Packages
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Import Data Packages</CardTitle>
          <CardDescription>
            Upload a CSV file to bulk import data packages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
              <p className="text-sm text-muted-foreground">
                CSV file must include columns: data_code, amount, description, duration, value, product_id
                <br />
                Optional columns: tariff_id, is_active
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePreview}
                disabled={!file || isProcessing}
                variant="outline"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={handleImport}
                disabled={parsedData.length === 0 || invalidRows.length > 0 || isProcessing}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isProcessing ? "Importing..." : `Import ${validRows.length} Package(s)`}
              </Button>
            </div>
          </div>

          {parsedData.length > 0 && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Preview</h3>
                <div className="flex gap-2">
                  <Badge variant="default">{validRows.length} Valid</Badge>
                  {invalidRows.length > 0 && (
                    <Badge variant="destructive">{invalidRows.length} Invalid</Badge>
                  )}
                </div>
              </div>

              <div className="rounded-md border max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data Code</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row, index) => (
                      <TableRow
                        key={index}
                        className={row.errors && row.errors.length > 0 ? "bg-destructive/10" : ""}
                      >
                        <TableCell className="font-mono">{row.data_code}</TableCell>
                        <TableCell>
                          {products?.find((p) => p.id === row.product_id)?.product_name || row.product_id}
                        </TableCell>
                        <TableCell>₦{Number(row.amount).toLocaleString()}</TableCell>
                        <TableCell>{row.value}</TableCell>
                        <TableCell>{row.duration}</TableCell>
                        <TableCell>
                          {row.errors && row.errors.length > 0 ? (
                            <div className="space-y-1">
                              <Badge variant="destructive">Invalid</Badge>
                              <div className="text-xs text-destructive">
                                {row.errors.join(", ")}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="default">Valid</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

