import { useState } from 'react';
import { Upload, CheckCircle2, Loader2, Hash, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useAddMember } from '@/hooks/useQueries';

interface FormState {
  membershipNumber: string;
  name: string;
  mobileNo: string;
  address: string;
  area: string;
  spouseName: string;
  alternateMobile: string;
  familyMemberCount: string;
}

interface YearState {
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
}

interface ReceiptState {
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
}

const initialFormState: FormState = {
  membershipNumber: '',
  name: '',
  mobileNo: '',
  address: '',
  area: '',
  spouseName: '',
  alternateMobile: '',
  familyMemberCount: '',
};

const initialYearState: YearState = {
  priorTo2021: false,
  year2022: false,
  year2023: false,
  year2024: false,
  year2025: false,
  year2026: false,
  year2027: false,
  year2028: false,
  year2029: false,
  year2030: false,
};

const initialReceiptState: ReceiptState = {
  receiptPriorTo2021: '',
  receipt2022: '',
  receipt2023: '',
  receipt2024: '',
  receipt2025: '',
  receipt2026: '',
  receipt2027: '',
  receipt2028: '',
  receipt2029: '',
  receipt2030: '',
};

const YEAR_LABELS: { yearKey: keyof YearState; receiptKey: keyof ReceiptState; label: string }[] = [
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

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function MembershipForm() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [years, setYears] = useState<YearState>(initialYearState);
  const [receipts, setReceipts] = useState<ReceiptState>(initialReceiptState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const addMember = useAddMember();

  const handleChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const numericFields: (keyof FormState)[] = ['mobileNo', 'alternateMobile'];
    const value = numericFields.includes(field)
      ? e.target.value.replace(/\D/g, '')
      : e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleYearChange = (key: keyof YearState, checked: boolean) => {
    setYears(prev => ({ ...prev, [key]: checked }));
  };

  const handleReceiptChange = (key: keyof ReceiptState) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setReceipts(prev => ({ ...prev, [key]: e.target.value }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.membershipNumber.trim()) newErrors.membershipNumber = 'Membership Number is required.';
    if (!form.name.trim()) newErrors.name = 'Full name is required.';
    if (!form.mobileNo.trim()) newErrors.mobileNo = 'Mobile number is required.';
    else if (form.mobileNo.length < 7) newErrors.mobileNo = 'Enter a valid mobile number.';
    if (!form.address.trim()) newErrors.address = 'Address is required.';
    if (!form.area.trim()) newErrors.area = 'Area is required.';
    if (!form.spouseName.trim()) newErrors.spouseName = 'Spouse name is required.';
    if (form.alternateMobile.trim() && form.alternateMobile.length < 7) {
      newErrors.alternateMobile = 'Enter a valid alternate mobile number.';
    }
    if (form.familyMemberCount.trim()) {
      const val = parseInt(form.familyMemberCount, 10);
      if (isNaN(val) || val < 0 || !Number.isInteger(val)) {
        newErrors.familyMemberCount = 'Family member count must be a non-negative whole number.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    if (!validate()) return;

    let familyMemberCount: bigint | null = null;
    if (form.familyMemberCount.trim()) {
      familyMemberCount = BigInt(parseInt(form.familyMemberCount, 10));
    }

    try {
      await addMember.mutateAsync({
        membershipNumber: form.membershipNumber.trim(),
        name: form.name.trim(),
        mobileNo: form.mobileNo.trim(),
        address: form.address.trim(),
        area: form.area.trim(),
        spouseName: form.spouseName.trim(),
        alternateMobile: form.alternateMobile.trim() || null,
        familyMemberCount,
        priorTo2021: years.priorTo2021 || null,
        year2022: years.year2022 || null,
        year2023: years.year2023 || null,
        year2024: years.year2024 || null,
        year2025: years.year2025 || null,
        year2026: years.year2026 || null,
        year2027: years.year2027 || null,
        year2028: years.year2028 || null,
        year2029: years.year2029 || null,
        year2030: years.year2030 || null,
        receiptPriorTo2021: receipts.receiptPriorTo2021.trim() || null,
        receipt2022: receipts.receipt2022.trim() || null,
        receipt2023: receipts.receipt2023.trim() || null,
        receipt2024: receipts.receipt2024.trim() || null,
        receipt2025: receipts.receipt2025.trim() || null,
        receipt2026: receipts.receipt2026.trim() || null,
        receipt2027: receipts.receipt2027.trim() || null,
        receipt2028: receipts.receipt2028.trim() || null,
        receipt2029: receipts.receipt2029.trim() || null,
        receipt2030: receipts.receipt2030.trim() || null,
      });

      setSuccessMessage(`${form.name.trim()} has been successfully registered as a member!`);
      setForm(initialFormState);
      setYears(initialYearState);
      setReceipts(initialReceiptState);
    } catch {
      setErrors(prev => ({ ...prev, name: 'Registration failed. Please try again.' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Success Alert */}
      {successMessage && (
        <Alert className="border-primary/30 bg-primary/5 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary font-medium">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Membership Number */}
      <div className="space-y-1.5">
        <Label htmlFor="membershipNumber" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-primary" />
          Membership Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="membershipNumber"
          type="text"
          placeholder="e.g. MEM001"
          value={form.membershipNumber}
          onChange={handleChange('membershipNumber')}
          className={`h-10 ${errors.membershipNumber ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          required
        />
        {errors.membershipNumber && (
          <p className="text-xs text-destructive">{errors.membershipNumber}</p>
        )}
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-semibold text-foreground">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter full name"
          value={form.name}
          onChange={handleChange('name')}
          className={`h-10 ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Spouse Name */}
      <div className="space-y-1.5">
        <Label htmlFor="spouseName" className="text-sm font-semibold text-foreground">
          Spouse Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="spouseName"
          type="text"
          placeholder="Enter spouse's full name"
          value={form.spouseName}
          onChange={handleChange('spouseName')}
          className={`h-10 ${errors.spouseName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {errors.spouseName && <p className="text-xs text-destructive">{errors.spouseName}</p>}
      </div>

      {/* Mobile No */}
      <div className="space-y-1.5">
        <Label htmlFor="mobileNo" className="text-sm font-semibold text-foreground">
          Mobile Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="mobileNo"
          type="tel"
          inputMode="numeric"
          placeholder="Enter mobile number"
          value={form.mobileNo}
          onChange={handleChange('mobileNo')}
          className={`h-10 ${errors.mobileNo ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {errors.mobileNo && <p className="text-xs text-destructive">{errors.mobileNo}</p>}
      </div>

      {/* Alternate Mobile No */}
      <div className="space-y-1.5">
        <Label htmlFor="alternateMobile" className="text-sm font-semibold text-foreground">
          Alternate Mobile Number{' '}
          <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
        </Label>
        <Input
          id="alternateMobile"
          type="tel"
          inputMode="numeric"
          placeholder="Enter alternate mobile number"
          value={form.alternateMobile}
          onChange={handleChange('alternateMobile')}
          className={`h-10 ${errors.alternateMobile ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {errors.alternateMobile && (
          <p className="text-xs text-destructive">{errors.alternateMobile}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="address" className="text-sm font-semibold text-foreground">
          Address <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="address"
          placeholder="Enter full address"
          value={form.address}
          onChange={handleChange('address')}
          rows={3}
          className={`resize-none ${errors.address ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
      </div>

      {/* Area */}
      <div className="space-y-1.5">
        <Label htmlFor="area" className="text-sm font-semibold text-foreground">
          Area <span className="text-destructive">*</span>
        </Label>
        <Input
          id="area"
          type="text"
          placeholder="Enter area / locality"
          value={form.area}
          onChange={handleChange('area')}
          className={`h-10 ${errors.area ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {errors.area && <p className="text-xs text-destructive">{errors.area}</p>}
      </div>

      {/* Membership Years */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          Membership Years{' '}
          <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
        </Label>
        <div className="space-y-2 p-4 rounded-lg border border-border bg-muted/20">
          {YEAR_LABELS.map(({ yearKey, receiptKey, label }) => (
            <div key={yearKey} className="flex flex-col sm:flex-row sm:items-center gap-2">
              {/* Checkbox + Year Label */}
              <div className="flex items-center gap-2 sm:w-36 shrink-0">
                <Checkbox
                  id={`year-${yearKey}`}
                  checked={years[yearKey]}
                  onCheckedChange={(checked) => handleYearChange(yearKey, checked === true)}
                />
                <Label
                  htmlFor={`year-${yearKey}`}
                  className="text-sm font-normal text-foreground cursor-pointer"
                >
                  {label}
                </Label>
              </div>
              {/* Receipt Number Input */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Label
                  htmlFor={`receipt-${receiptKey}`}
                  className="text-xs text-muted-foreground shrink-0 whitespace-nowrap"
                >
                  Receipt No.
                </Label>
                <Input
                  id={`receipt-${receiptKey}`}
                  type="text"
                  placeholder="e.g. REC-001"
                  value={receipts[receiptKey]}
                  onChange={handleReceiptChange(receiptKey)}
                  className="h-8 text-xs flex-1 min-w-0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Family Member Count */}
      <div className="space-y-1.5">
        <Label htmlFor="familyMemberCount" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-primary" />
          Family Member Count{' '}
          <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
        </Label>
        <Input
          id="familyMemberCount"
          type="number"
          inputMode="numeric"
          min="0"
          placeholder="e.g. 4"
          value={form.familyMemberCount}
          onChange={handleChange('familyMemberCount')}
          className={`h-10 ${errors.familyMemberCount ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {errors.familyMemberCount && (
          <p className="text-xs text-destructive">{errors.familyMemberCount}</p>
        )}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={addMember.isPending}
          className="w-full h-11 text-sm font-semibold"
        >
          {addMember.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registering Member...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Register Member
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
