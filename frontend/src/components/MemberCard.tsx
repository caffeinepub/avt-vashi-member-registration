import { Phone, MapPin, Map, Heart, Hash, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Member } from '../backend';

interface MemberCardProps {
  member: Member;
}

export default function MemberCard({ member }: MemberCardProps) {
  return (
    <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200 animate-fade-in border border-border">
      <CardContent className="p-0">
        {/* Membership Number */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-2">
          <Hash className="w-3.5 h-3.5 text-primary flex-shrink-0" />
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
            <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="font-medium text-foreground">{member.mobileNo}</span>
          </div>

          {member.alternateMobile && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Phone className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
              <span className="text-muted-foreground">{member.alternateMobile}</span>
              <span className="text-xs text-muted-foreground/60">(Alt)</span>
            </div>
          )}

          {member.spouseName && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Heart className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-foreground">{member.spouseName}</span>
            </div>
          )}

          <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <span className="leading-snug line-clamp-2">{member.address}</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Map className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span>{member.area}</span>
          </div>

          {member.familyMemberCount !== undefined && member.familyMemberCount !== null && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-foreground">
                {member.familyMemberCount.toString()} family member{member.familyMemberCount !== BigInt(1) ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
