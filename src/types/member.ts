
// Member related types
export interface Member {
  _id?: string; // MongoDB ID
  id: string;   // Maintain compatibility with existing code
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipDate: string;
  status: 'active' | 'inactive' | 'suspended';
}

// Define member reference type
export type MemberReference = string | { id: string; _id?: string; name?: string; email?: string };
