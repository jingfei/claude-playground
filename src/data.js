export const ROLES    = ['admin', 'member']
export const STATUSES = ['active', 'inactive', 'pending']

export const seedUsers = [
  { id: 'u1', name: 'Alice Chen',   email: 'alice@example.com', status: 'active',   role: 'admin'  },
  { id: 'u2', name: 'Bob Smith',    email: 'bob@example.com',   status: 'active',   role: 'member' },
  { id: 'u3', name: 'Carol Jones',  email: 'carol@example.com', status: 'pending',  role: 'member' },
  { id: 'u4', name: 'David Lee',    email: 'david@example.com', status: 'active',   role: 'member' },
  { id: 'u5', name: 'Emma Wilson',  email: 'emma@example.com',  status: 'inactive', role: 'member' },
]

export const seedGroups = [
  { id: 'g1', name: 'Engineering', description: 'Product engineering team', memberIds: ['u1','u2','u4'] },
  { id: 'g2', name: 'Design',      description: 'Product design team',      memberIds: ['u1','u4']     },
  { id: 'g3', name: 'Marketing',   description: 'Marketing and growth',     memberIds: []               },
]

/** The signed-in user for this demo session. */
export const CURRENT_USER = seedUsers[0] // Alice Chen — admin
