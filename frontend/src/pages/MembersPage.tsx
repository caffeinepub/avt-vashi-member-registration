import { useState } from 'react';
import MemberList from '@/components/MemberList';
import { Users, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Member } from '@/backend';
import { useGetAllMembers } from '@/hooks/useQueries';

function generateCSV(members: Member[]): string {
  const headers = [
    'Membership Number',
    'Name',
    'Mobile No',
    'Alternate Mobile',
    'Address',
    'Area',
    'Spouse Name',
    'Family Member Count',
    'Prior to 2021',
    'Receipt Prior to 2021',
    '2022',
    'Receipt 2022',
    '2023',
    'Receipt 2023',
    '2024',
    'Receipt 2024',
    '2025',
    'Receipt 2025',
    '2026',
    'Receipt 2026',
    '2027',
    'Receipt 2027',
    '2028',
    'Receipt 2028',
    '2029',
    'Receipt 2029',
    '2030',
    'Receipt 2030',
  ];

  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const boolToYesNo = (val: boolean | undefined | null): string => {
    return val === true ? 'Yes' : 'No';
  };

  const rows = members.map((m) => [
    escapeCSV(m.membershipNumber),
    escapeCSV(m.name),
    escapeCSV(m.mobileNo),
    escapeCSV(m.alternateMobile ?? ''),
    escapeCSV(m.address),
    escapeCSV(m.area),
    escapeCSV(m.spouseName),
    m.familyMemberCount !== undefined && m.familyMemberCount !== null
      ? m.familyMemberCount.toString()
      : '',
    boolToYesNo(m.priorTo2021),
    escapeCSV(m.receiptPriorTo2021 ?? ''),
    boolToYesNo(m.year2022),
    escapeCSV(m.receipt2022 ?? ''),
    boolToYesNo(m.year2023),
    escapeCSV(m.receipt2023 ?? ''),
    boolToYesNo(m.year2024),
    escapeCSV(m.receipt2024 ?? ''),
    boolToYesNo(m.year2025),
    escapeCSV(m.receipt2025 ?? ''),
    boolToYesNo(m.year2026),
    escapeCSV(m.receipt2026 ?? ''),
    boolToYesNo(m.year2027),
    escapeCSV(m.receipt2027 ?? ''),
    boolToYesNo(m.year2028),
    escapeCSV(m.receipt2028 ?? ''),
    boolToYesNo(m.year2029),
    escapeCSV(m.receipt2029 ?? ''),
    boolToYesNo(m.year2030),
    escapeCSV(m.receipt2030 ?? ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function MembersPage() {
  const { data: members, isLoading } = useGetAllMembers();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDownload = () => {
    const data = members ?? [];
    const csv = generateCSV(data);
    const date = new Date().toISOString().slice(0, 10);
    downloadCSV(csv, `members_database_${date}.csv`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Page Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Title row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
                Membership List
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                All registered members in the database
              </p>
            </div>
          </div>

          {/* Search + Download row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by name, membership no., mobile, area, spouse, address…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-primary/30 focus-visible:ring-primary/40"
              />
            </div>

            {/* Download Database button */}
            <Button
              variant="default"
              size="default"
              onClick={handleDownload}
              disabled={isLoading}
              className="flex items-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              {isLoading ? 'Loading…' : 'Download Database'}
            </Button>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <MemberList searchQuery={searchQuery} />
      </div>
    </div>
  );
}
