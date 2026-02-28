import React, { useRef, useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, AlertTriangle, Loader2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBulkAddMembers } from '@/hooks/useQueries';
import type { BulkMemberInput } from '@/backend';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedRow {
  rowIndex: number;
  membershipNumber: string;
  name: string;
  mobileNo: string;
  address: string;
  area: string;
  spouseName: string;
  alternateMobile: string;
  familyMemberCount: string;
  errors: string[];
  isValid: boolean;
}

// ─── CSV Helpers ──────────────────────────────────────────────────────────────

const REQUIRED_COLUMNS = ['Membership Number', 'Name', 'Mobile No', 'Address', 'Area', 'Spouse Name'] as const;
const OPTIONAL_COLUMNS = ['Alternate Mobile', 'Family Member Count'] as const;
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.trim());

  // Build column index map (case-insensitive)
  const colIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    colIndex[h.toLowerCase()] = i;
  });

  const getCol = (row: string[], colName: string): string => {
    const idx = colIndex[colName.toLowerCase()];
    if (idx === undefined) return '';
    return (row[idx] ?? '').trim();
  };

  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i]);
    const errors: string[] = [];

    const membershipNumber = getCol(cells, 'Membership Number');
    const name = getCol(cells, 'Name');
    const mobileNo = getCol(cells, 'Mobile No');
    const address = getCol(cells, 'Address');
    const area = getCol(cells, 'Area');
    const spouseName = getCol(cells, 'Spouse Name');
    const alternateMobile = getCol(cells, 'Alternate Mobile');
    const familyMemberCount = getCol(cells, 'Family Member Count');

    if (!membershipNumber) errors.push('Membership Number is required');
    if (!name) errors.push('Name is required');
    if (!mobileNo) errors.push('Mobile No is required');
    if (!address) errors.push('Address is required');
    if (!area) errors.push('Area is required');
    if (!spouseName) errors.push('Spouse Name is required');
    if (familyMemberCount) {
      const val = parseInt(familyMemberCount, 10);
      if (isNaN(val) || val < 0) {
        errors.push('Family Member Count must be a non-negative number');
      }
    }

    rows.push({
      rowIndex: i,
      membershipNumber,
      name,
      mobileNo,
      address,
      area,
      spouseName,
      alternateMobile,
      familyMemberCount,
      errors,
      isValid: errors.length === 0,
    });
  }

  return rows;
}

function downloadSampleCSV() {
  const header = ALL_COLUMNS.join(',');
  const sample = [
    'MEM001,John Doe,9876543210,"123 Main St, City",Downtown,Jane Doe,9876543211,4',
    'MEM002,Alice Smith,8765432109,"456 Oak Ave, Town",Uptown,Bob Smith,,2',
  ].join('\n');
  const content = `${header}\n${sample}`;
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'members_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BulkUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const bulkAddMembers = useBulkAddMembers();

  const validRows = rows.filter((r) => r.isValid);
  const invalidRows = rows.filter((r) => !r.isValid);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please select a valid .csv file.');
      return;
    }
    setFileName(file.name);
    setImportedCount(null);
    bulkAddMembers.reset();

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
      setHasParsed(true);
    };
    reader.readAsText(file);
  }, [bulkAddMembers]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleSubmit = async () => {
    if (validRows.length === 0) return;

    const membersInput: BulkMemberInput[] = validRows.map((row) => {
      let familyMemberCount: bigint | undefined = undefined;
      if (row.familyMemberCount.trim()) {
        const val = parseInt(row.familyMemberCount, 10);
        if (!isNaN(val) && val >= 0) {
          familyMemberCount = BigInt(val);
        }
      }
      return {
        membershipNumber: row.membershipNumber,
        name: row.name,
        mobileNo: row.mobileNo,
        address: row.address,
        area: row.area,
        spouseName: row.spouseName,
        alternateMobile: row.alternateMobile || undefined,
        familyMemberCount,
      };
    });

    try {
      const count = await bulkAddMembers.mutateAsync(membersInput);
      setImportedCount(Number(count));
      setRows([]);
      setHasParsed(false);
      setFileName(null);
    } catch {
      // Error is shown via bulkAddMembers.error
    }
  };

  const handleReset = () => {
    setRows([]);
    setHasParsed(false);
    setFileName(null);
    setImportedCount(null);
    bulkAddMembers.reset();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">Bulk CSV Upload</h1>
        <p className="text-muted-foreground">
          Import multiple members at once by uploading a CSV file.
        </p>
      </div>

      {/* Success Banner */}
      {importedCount !== null && (
        <Alert className="mb-6 border-green-500/40 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700 dark:text-green-400">Import Successful</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-500">
            Successfully imported {importedCount} member{importedCount !== 1 ? 's' : ''}.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Banner */}
      {bulkAddMembers.isError && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Import Failed</AlertTitle>
          <AlertDescription>
            {bulkAddMembers.error instanceof Error
              ? bulkAddMembers.error.message
              : 'An unexpected error occurred. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Upload Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Upload CSV File</CardTitle>
              <CardDescription className="text-xs">
                Drag & drop or click to select a .csv file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                {fileName ? (
                  <div>
                    <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to replace</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-foreground">Drop CSV here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={downloadSampleCSV}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download Template
                </Button>
                {hasParsed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground"
                    onClick={handleReset}
                  >
                    Clear & Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Template Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                CSV Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Required columns:</p>
                  <div className="flex flex-wrap gap-1">
                    {REQUIRED_COLUMNS.map((col) => (
                      <Badge key={col} variant="default" className="text-xs px-1.5 py-0">
                        {col}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Optional columns:</p>
                  <div className="flex flex-wrap gap-1">
                    {OPTIONAL_COLUMNS.map((col) => (
                      <Badge key={col} variant="outline" className="text-xs px-1.5 py-0">
                        {col}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          {hasParsed && (
            <Card>
              <CardContent className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total rows</span>
                  <span className="font-medium">{rows.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400">Valid</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{validRows.length}</span>
                </div>
                {invalidRows.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-destructive">Invalid</span>
                    <span className="font-medium text-destructive">{invalidRows.length}</span>
                  </div>
                )}
                <Button
                  className="w-full mt-2"
                  size="sm"
                  disabled={validRows.length === 0 || bulkAddMembers.isPending}
                  onClick={handleSubmit}
                >
                  {bulkAddMembers.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Import {validRows.length} Member{validRows.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Preview Table */}
        <div className="lg:col-span-2">
          {!hasParsed ? (
            <Card className="h-full flex items-center justify-center min-h-[300px]">
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium">No file uploaded yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a CSV file to preview the data before importing
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Preview</CardTitle>
                  {invalidRows.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {invalidRows.length} row{invalidRows.length !== 1 ? 's' : ''} with errors
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10 text-xs">#</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Membership No</TableHead>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Mobile</TableHead>
                        <TableHead className="text-xs">Area</TableHead>
                        <TableHead className="text-xs">Spouse</TableHead>
                        <TableHead className="text-xs">Errors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow
                          key={row.rowIndex}
                          className={row.isValid ? '' : 'bg-destructive/5'}
                        >
                          <TableCell className="text-xs text-muted-foreground">{row.rowIndex}</TableCell>
                          <TableCell>
                            {row.isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {row.membershipNumber || (
                              <span className="text-destructive italic">missing</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">{row.name || <span className="text-muted-foreground italic">—</span>}</TableCell>
                          <TableCell className="text-xs">{row.mobileNo || <span className="text-muted-foreground italic">—</span>}</TableCell>
                          <TableCell className="text-xs">{row.area || <span className="text-muted-foreground italic">—</span>}</TableCell>
                          <TableCell className="text-xs">{row.spouseName || <span className="text-muted-foreground italic">—</span>}</TableCell>
                          <TableCell className="text-xs">
                            {row.errors.length > 0 ? (
                              <ul className="space-y-0.5">
                                {row.errors.map((err, idx) => (
                                  <li key={idx} className="text-destructive">{err}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-green-600 dark:text-green-400">OK</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
