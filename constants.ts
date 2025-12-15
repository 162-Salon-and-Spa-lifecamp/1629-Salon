import { Product, ServiceCategory, User, UserRole } from "./types";

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Sarah Manager', role: UserRole.MANAGER, pin: '1111', jobTitle: 'General Manager', isClockedIn: false },
  { id: 'u2', name: 'Mike Supervisor', role: UserRole.SUPERVISOR, pin: '2222', jobTitle: 'Floor Lead', isClockedIn: false },
  { id: 'u3', name: 'Jessica Stylist', role: UserRole.STAFF, pin: '3333', jobTitle: 'Hair Stylist', isClockedIn: false },
  { id: 'u4', name: 'David Barber', role: UserRole.STAFF, pin: '4444', jobTitle: 'Master Barber', isClockedIn: false },
  { id: 'u5', name: 'Lisa Tech', role: UserRole.STAFF, pin: '5555', jobTitle: 'Nail Technician', isClockedIn: false },
];

export const MOCK_CATALOG: Product[] = [
  // Hair
  { id: 's1', name: 'Ladies Cut & Style', price: 5000, category: ServiceCategory.HAIR, subCategory: 'Cutting', isRetail: false },
  { id: 's2', name: 'Full Weave Install', price: 15000, category: ServiceCategory.HAIR, subCategory: 'Weaveon Section', isRetail: false },
  // Barber
  { id: 's3', name: 'Classic Cut', price: 3000, category: ServiceCategory.BARBER, subCategory: 'Men\'s Wear', isRetail: false },
  { id: 's4', name: 'Beard Trim & Shape', price: 2000, category: ServiceCategory.BARBER, subCategory: 'Men\'s Wear', isRetail: false },
  // Nails
  { id: 's5', name: 'Gel Manicure', price: 4500, category: ServiceCategory.NAILS, subCategory: 'Manicure', isRetail: false },
  { id: 's6', name: 'Pedicure Spa', price: 6000, category: ServiceCategory.NAILS, subCategory: 'Pedicure', isRetail: false },
  // Retail
  { id: 'p1', name: 'Argan Oil Shampoo', price: 4500, category: ServiceCategory.RETAIL, subCategory: 'Hair Care', isRetail: true, stockLevel: 12, minReorderPoint: 5 },
  { id: 'p2', name: 'Matte Clay Pomade', price: 3500, category: ServiceCategory.RETAIL, subCategory: 'Men\'s Grooming', isRetail: true, stockLevel: 3, minReorderPoint: 5 }, // Low stock example
  { id: 'p3', name: 'Cuticle Oil', price: 1500, category: ServiceCategory.RETAIL, subCategory: 'Nail Care', isRetail: true, stockLevel: 20, minReorderPoint: 5 },
];