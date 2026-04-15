export const ROLES    = ['admin', 'editor', 'viewer']
export const STATUSES = ['active', 'inactive', 'pending']

export const seedUsers = [
  { id: 'u1', name: 'Alice Chen',     email: 'alice@example.com',  role: 'admin',  status: 'active'   },
  { id: 'u2', name: 'Bob Smith',      email: 'bob@example.com',    role: 'editor', status: 'active'   },
  { id: 'u3', name: 'Carol White',    email: 'carol@example.com',  role: 'viewer', status: 'inactive' },
  { id: 'u4', name: 'David Lee',      email: 'david@example.com',  role: 'editor', status: 'active'   },
  { id: 'u5', name: 'Eva Martinez',   email: 'eva@example.com',    role: 'viewer', status: 'pending'  },
  { id: 'u6', name: 'Frank Wilson',   email: 'frank@example.com',  role: 'admin',  status: 'active'   },
  { id: 'u7', name: 'Grace Kim',      email: 'grace@example.com',  role: 'viewer', status: 'active'   },
  { id: 'u8', name: 'Henry Brown',    email: 'henry@example.com',  role: 'editor', status: 'inactive' },
]

export const seedGroups = [
  { id: 'g1', name: 'Engineering',  description: 'Core product engineering team responsible for platform development.', memberIds: ['u1','u2','u4','u6'] },
  { id: 'g2', name: 'Design',       description: 'UX and visual design team shaping the product experience.',           memberIds: ['u3','u7']           },
  { id: 'g3', name: 'Marketing',    description: 'Growth, content, and brand marketing initiatives.',                    memberIds: ['u5','u8']           },
  { id: 'g4', name: 'Leadership',   description: 'Executive team and senior stakeholders.',                              memberIds: ['u1','u6']           },
]

/** The signed-in user for this demo session. */
export const CURRENT_USER = seedUsers[0] // Alice Chen — admin
