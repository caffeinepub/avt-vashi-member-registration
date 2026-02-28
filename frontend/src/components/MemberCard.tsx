import { Phone, MapPin, Map, Heart, Hash, Users, Calendar, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Member } from '../backend';

interface MemberCardProps {
  member: Member;
}

const YEAR_ENTRIES: {
  yearKey: keyof Member;
  receiptKey: keyof Member;
  label: string;
}[] = [
  { yearKey: 'priorTo2021', receiptKey: 'receiptPriorTo2021', label: 'Prior to 2021' },
  { yearKey: 'year2022', receiptKey: 'receipt2022', label: '2022' },
  { yearKey: 'year2023', receiptKey: 'receipt2023', label: '2023' },
  { yearKey: 'year2024', receiptKey: 'receipt2024', label: '2024' },
  { yearKey: 'year2025', receiptKey: 'receipt2025', label: '2025' },
  { yearKey: 'year2026', receiptKey: 'receipt2026', label: '2026' },
  { yearKey: 'year2027', receiptKey: 'receipt2027', label: '2027' },
  { yearKey: 'year2028', receiptKey: 'receipt2028', label: '2028' },
  { yearKey: 'year2029', receiptKey: 'receipt2029', label: '2029' },
  { yearKey: 'year2030', receiptKey: 'receipt2030', label: '2030' },
];

export default function MemberCard({ member }: MemberCardProps) {
  const activeYears = YEAR_ENTRIES.filter(({ yearKey }) => member[yearKey] === true);

  return (
    <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200 animate-fade-in border border-border">
      <CardContent className="p-0">
        {/* Membership Number */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-2">
          <Hash className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold text-primary tracking-wide uppercase">
            {member.id}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mx-5" />

        {/* Name + Area Badge */}
        <div className="px-5 pt-3 pb-2">
          <h3 className="font-semibold text-foreground text-base leading-tight truncate">
            {member.name}
          </h3>
          <div className="mt-1.5">
            <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
              {member.area}
            </Badge>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mx-5" />

        {/* Details */}
        <div className="px-5 py-4 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground">{member.mobileNo}</span>
          </div>

          {member.alternateMobile && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Phone className="w-3.5 h-3.5 text-primary/60 shrink-0" />
              <span className="text-muted-foreground">{member.alternateMobile}</span>
              <span className="text-xs text-muted-foreground/60">(Alt)</span>
            </div>
          )}

          {member.spouseName && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Heart className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-foreground">{member.spouseName}</span>
            </div>
          )}

          <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span className="leading-snug line-clamp-2">{member.address}</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Map className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{member.area}</span>
          </div>

          {member.familyMemberCount !== undefined && member.familyMemberCount !== null && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Users className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-foreground">
                {member.familyMemberCount.toString()} family member{member.familyMemberCount !== BigInt(1) ? 's' : ''}
              </span>
            </div>
          )}

          {activeYears.length > 0 && (
            <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5 w-full">
                {activeYears.map(({ yearKey, receiptKey, label }) => {
                  const receipt = member[receiptKey] as string | undefined;
                  return (
                    <div key={yearKey} className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0 font-medium border-primary/40 text-primary"
                      >
                        {label}
                      </Badge>
                      {receipt && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Receipt className="w-3 h-3 shrink-0" />
                          {receipt}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
