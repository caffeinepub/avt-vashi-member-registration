import MemberList from '@/components/MemberList';
import { Users, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  ];

  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
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
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-700 text-foreground tracking-tight">
                  Membership List
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  All registered members in the database
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isLoading}
              className="flex items-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              Download Database
            </Button>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <MemberList />
      </div>
    </div>
  );
}
