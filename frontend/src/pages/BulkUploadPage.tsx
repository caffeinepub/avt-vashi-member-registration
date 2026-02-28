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
  priorTo2021: boolean;
  year2022: boolean;
  year2023: boolean;
  year2024: boolean;
  year2025: boolean;
  year2026: boolean;
  year2027: boolean;
  year2028: boolean;
  year2029: boolean;
  year2030: boolean;
  receiptPriorTo2021: string;
  receipt2022: string;
  receipt2023: string;
  receipt2024: string;
  receipt2025: string;
  receipt2026: string;
  receipt2027: string;
  receipt2028: string;
  receipt2029: string;
  receipt2030: string;
  errors: string[];
  isValid: boolean;
}

// ─── CSV Helpers ──────────────────────────────────────────────────────────────

const REQUIRED_COLUMNS = ['Membership Number', 'Name', 'Mobile No', 'Address', 'Area', 'Spouse Name'] as const;
const OPTIONAL_COLUMNS = ['Alternate Mobile', 'Family Member Count'] as const;
const YEAR_COLUMNS = ['Prior to 2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'] as const;
const RECEIPT_COLUMNS = [
  'Receipt Prior to 2021',
  'Receipt 2022',
  'Receipt 2023',
  'Receipt 2024',
  'Receipt 2025',
  'Receipt 2026',
  'Receipt 2027',
  'Receipt 2028',
  'Receipt 2029',
  'Receipt 2030',
] as const;

// Interleave year and receipt columns for the template header
const YEAR_RECEIPT_COLUMNS: string[] = [];
YEAR_COLUMNS.forEach((y, i) => {
  YEAR_RECEIPT_COLUMNS.push(y);
  YEAR_RECEIPT_COLUMNS.push(RECEIPT_COLUMNS[i]);
});

const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS, ...YEAR_RECEIPT_COLUMNS];

function parseBooleanCol(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

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

    // Year columns
    const priorTo2021 = parseBooleanCol(getCol(cells, 'Prior to 2021'));
    const year2022 = parseBooleanCol(getCol(cells, '2022'));
    const year2023 = parseBooleanCol(getCol(cells, '2023'));
    const year2024 = parseBooleanCol(getCol(cells, '2024'));
    const year2025 = parseBooleanCol(getCol(cells, '2025'));
    const year2026 = parseBooleanCol(getCol(cells, '2026'));
    const year2027 = parseBooleanCol(getCol(cells, '2027'));
    const year2028 = parseBooleanCol(getCol(cells, '2028'));
    const year2029 = parseBooleanCol(getCol(cells, '2029'));
    const year2030 = parseBooleanCol(getCol(cells, '2030'));

    // Receipt columns
    const receiptPriorTo2021 = getCol(cells, 'Receipt Prior to 2021');
    const receipt2022 = getCol(cells, 'Receipt 2022');
    const receipt2023 = getCol(cells, 'Receipt 2023');
    const receipt2024 = getCol(cells, 'Receipt 2024');
    const receipt2025 = getCol(cells, 'Receipt 2025');
    const receipt2026 = getCol(cells, 'Receipt 2026');
    const receipt2027 = getCol(cells, 'Receipt 2027');
    const receipt2028 = getCol(cells, 'Receipt 2028');
    const receipt2029 = getCol(cells, 'Receipt 2029');
    const receipt2030 = getCol(cells, 'Receipt 2030');

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
      priorTo2021,
      year2022,
      year2023,
      year2024,
      year2025,
      year2026,
      year2027,
      year2028,
      year2029,
      year2030,
      receiptPriorTo2021,
      receipt2022,
      receipt2023,
      receipt2024,
      receipt2025,
      receipt2026,
      receipt2027,
      receipt2028,
      receipt2029,
      receipt2030,
      errors,
      isValid: errors.length === 0,
    });
  }

  return rows;
}

function downloadSampleCSV() {
  const header = ALL_COLUMNS.join(',');
  const sample = [
    'MEM001,John Doe,9876543210,"123 Main St, City",Downtown,Jane Doe,9876543211,4,Yes,REC-001,No,,No,,Yes,REC-004,Yes,REC-005,No,,No,,No,,No,,No,',
    'MEM002,Alice Smith,8765432109,"456 Oak Ave, Town",Uptown,Bob Smith,,2,No,,No,,No,,No,,Yes,REC-005,Yes,REC-006,No,,No,,No,,No,',
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
        priorTo2021: row.priorTo2021 || undefined,
        year2022: row.year2022 || undefined,
        year2023: row.year2023 || undefined,
        year2024: row.year2024 || undefined,
        year2025: row.year2025 || undefined,
        year2026: row.year2026 || undefined,
        year2027: row.year2027 || undefined,
        year2028: row.year2028 || undefined,
        year2029: row.year2029 || undefined,
        year2030: row.year2030 || undefined,
        receiptPriorTo2021: row.receiptPriorTo2021 || undefined,
        receipt2022: row.receipt2022 || undefined,
        receipt2023: row.receipt2023 || undefined,
        receipt2024: row.receipt2024 || undefined,
        receipt2025: row.receipt2025 || undefined,
        receipt2026: row.receipt2026 || undefined,
        receipt2027: row.receipt2027 || undefined,
        receipt2028: row.receipt2028 || undefined,
        receipt2029: row.receipt2029 || undefined,
        receipt2030: row.receipt2030 || undefined,
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
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Membership year columns:</p>
                  <div className="flex flex-wrap gap-1">
                    {YEAR_COLUMNS.map((col) => (
                      <Badge key={col} variant="secondary" className="text-xs px-1.5 py-0">
                        {col}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use <span className="font-mono">Yes</span>, <span className="font-mono">1</span>, or <span className="font-mono">true</span> to mark a year active.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Receipt number columns:</p>
                  <div className="flex flex-wrap gap-1">
                    {RECEIPT_COLUMNS.map((col) => (
                      <Badge key={col} variant="outline" className="text-xs px-1.5 py-0 border-primary/30 text-primary">
                        {col}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional text value for the receipt number of each year.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          {hasParsed && (
            <Card>
              <CardContent className="pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total rows</span>
                  <span className="font-semibold">{rows.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-600 dark:text-green-400">Valid</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{validRows.length}</span>
                </div>
                {invalidRows.length > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-destructive">Invalid</span>
                    <span className="font-semibold text-destructive">{invalidRows.length}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Import Button */}
          {hasParsed && validRows.length > 0 && (
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={bulkAddMembers.isPending}
            >
              {bulkAddMembers.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import {validRows.length} Member{validRows.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Right Panel - Preview Table */}
        <div className="lg:col-span-2">
          {!hasParsed ? (
            <Card className="h-full flex items-center justify-center min-h-64">
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">Upload a CSV file to preview its contents</p>
                <p className="text-muted-foreground/60 text-xs mt-1">
                  Download the template to see the expected format
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Preview</CardTitle>
                <CardDescription className="text-xs">
                  {rows.length} row{rows.length !== 1 ? 's' : ''} parsed from {fileName}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs w-8">#</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Membership No.</TableHead>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Mobile</TableHead>
                        <TableHead className="text-xs">Area</TableHead>
                        <TableHead className="text-xs">Years</TableHead>
                        <TableHead className="text-xs">Errors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => {
                        const activeYears = [
                          row.priorTo2021 && 'Prior to 2021',
                          row.year2022 && '2022',
                          row.year2023 && '2023',
                          row.year2024 && '2024',
                          row.year2025 && '2025',
                          row.year2026 && '2026',
                          row.year2027 && '2027',
                          row.year2028 && '2028',
                          row.year2029 && '2029',
                          row.year2030 && '2030',
                        ].filter(Boolean) as string[];

                        return (
                          <TableRow key={row.rowIndex} className={!row.isValid ? 'bg-destructive/5' : ''}>
                            <TableCell className="text-xs text-muted-foreground">{row.rowIndex}</TableCell>
                            <TableCell>
                              {row.isValid ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-destructive" />
                              )}
                            </TableCell>
                            <TableCell className="text-xs font-medium">{row.membershipNumber || '—'}</TableCell>
                            <TableCell className="text-xs">{row.name || '—'}</TableCell>
                            <TableCell className="text-xs">{row.mobileNo || '—'}</TableCell>
                            <TableCell className="text-xs">{row.area || '—'}</TableCell>
                            <TableCell className="text-xs">
                              <div className="flex flex-wrap gap-0.5">
                                {activeYears.length > 0
                                  ? activeYears.map((y) => (
                                      <Badge key={y} variant="secondary" className="text-xs px-1 py-0">
                                        {y}
                                      </Badge>
                                    ))
                                  : <span className="text-muted-foreground">—</span>
                                }
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">
                              {row.errors.length > 0 ? (
                                <div className="flex items-start gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                                  <span className="text-destructive text-xs">{row.errors.join('; ')}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
