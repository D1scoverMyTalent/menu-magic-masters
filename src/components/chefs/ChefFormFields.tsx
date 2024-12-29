import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChefFormFieldsProps {
  formData: {
    name: string;
    email: string;
    speciality: string;
    experience_years: string;
    phone: string;
    password?: string;
  };
  isNewChef: boolean;
  onChange: (field: string, value: string) => void;
}

export const ChefFormFields = ({ formData, isNewChef, onChange }: ChefFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Enter chef's name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email address"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          required
        />
      </div>

      {isNewChef && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            required
            minLength={6}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="speciality">Speciality</Label>
        <Input
          id="speciality"
          placeholder="Enter chef's speciality"
          value={formData.speciality}
          onChange={(e) => onChange('speciality', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">Years of Experience</Label>
        <Input
          id="experience"
          type="number"
          placeholder="Enter years of experience"
          value={formData.experience_years}
          onChange={(e) => onChange('experience_years', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Enter phone number"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
        />
      </div>
    </>
  );
};