import db from "./models/database.js";

const generateId = (prefix) => `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

const seedData = async () => {
  try {
    // Seed departments
    const depts = [
      { id: "dep-1", name: "Engineering", head: "emp-3", parent: null, status: "Active" },
      { id: "dep-2", name: "Operations", head: "emp-2", parent: null, status: "Active" },
      { id: "dep-3", name: "Facilities", head: null, parent: null, status: "Active" },
      { id: "dep-4", name: "Human Resources", head: null, parent: null, status: "Active" },
    ];

    for (const dept of depts) {
      await db.run(
        "INSERT OR IGNORE INTO departments (id, name, head_id, parent_id, status) VALUES (?, ?, ?, ?, ?)",
        [dept.id, dept.name, dept.head, dept.parent, dept.status]
      );
    }

    // Seed categories
    const cats = [
      { id: "cat-1", name: "Electronics", extra: "Warranty Period" },
      { id: "cat-2", name: "Furniture", extra: null },
      { id: "cat-3", name: "Vehicles", extra: "Insurance Expiry" },
      { id: "cat-4", name: "Equipment", extra: null },
    ];

    for (const cat of cats) {
      await db.run(
        "INSERT OR IGNORE INTO categories (id, name, extra_field) VALUES (?, ?, ?)",
        [cat.id, cat.name, cat.extra]
      );
    }

    // Seed users (with hashed password: "password")
    const users = [
      { id: "emp-1", name: "Admin User", email: "admin@assetflow.io", dept: "dep-2", role: "Admin" },
      { id: "emp-2", name: "Priya Nair", email: "priya@assetflow.io", dept: "dep-2", role: "Asset Manager" },
      { id: "emp-3", name: "Rajesh Kumar", email: "raj@assetflow.io", dept: "dep-1", role: "Department Head" },
      { id: "emp-4", name: "Ananya Iyer", email: "ananya@assetflow.io", dept: "dep-1", role: "Employee" },
      { id: "emp-5", name: "Vikram Shah", email: "vikram@assetflow.io", dept: "dep-3", role: "Employee" },
      { id: "emp-6", name: "Divya Menon", email: "divya@assetflow.io", dept: "dep-4", role: "Employee" },
    ];

    const hashedPassword = "$2a$10$6/hUVhGmTPb4Zb4numi0VO9uDkIyyaWHZ2U436nKgRx2bS6ryuNDa"; // bcrypt hash of "password"

    for (const user of users) {
      await db.run(
        "INSERT OR IGNORE INTO users (id, name, email, password, department_id, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [user.id, user.name, user.email, hashedPassword, user.dept, user.role, "Active"]
      );
      await db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);
    }

    // Seed assets
    const assets = [
      { id: "ast-1", tag: "AF-0001", name: "Dell Latitude 5440", cat: "cat-1", serial: "SN-88213", acq: "2024-11-02", cost: 92000, cond: "Good", loc: "HQ - 3F", shared: 0, status: "Allocated", alloc_type: "employee", alloc_id: "emp-4", exp_return: "2026-06-10" },
      { id: "ast-2", tag: "AF-0002", name: "Conference Room B2", cat: "cat-4", serial: "SN-ROOMB2", acq: "2023-03-14", cost: 0, cond: "Good", loc: "HQ - 2F", shared: 1, status: "Available", alloc_type: null, alloc_id: null, exp_return: null },
      { id: "ast-3", tag: "AF-0003", name: "Toyota Innova (TN-09 AB 4521)", cat: "cat-3", serial: "SN-VEH4521", acq: "2022-07-19", cost: 1450000, cond: "Fair", loc: "HQ - Basement Parking", shared: 1, status: "Reserved", alloc_type: null, alloc_id: null, exp_return: null },
      { id: "ast-4", tag: "AF-0004", name: "HP LaserJet Pro M404", cat: "cat-1", serial: "SN-77102", acq: "2024-01-22", cost: 21000, cond: "Needs Repair", loc: "HQ - 1F", shared: 0, status: "Under Maintenance", alloc_type: null, alloc_id: null, exp_return: null },
      { id: "ast-5", tag: "AF-0005", name: "Ergonomic Office Chair", cat: "cat-2", serial: "SN-CHR3391", acq: "2023-09-11", cost: 8500, cond: "Good", loc: "HQ - 3F", shared: 0, status: "Allocated", alloc_type: "employee", alloc_id: "emp-3", exp_return: "2026-07-01" },
      { id: "ast-6", tag: "AF-0006", name: "Projector Epson EB-X51", cat: "cat-1", serial: "SN-55210", acq: "2023-05-30", cost: 34000, cond: "Good", loc: "HQ - 2F", shared: 1, status: "Available", alloc_type: null, alloc_id: null, exp_return: null },
      { id: "ast-7", tag: "AF-0007", name: "Standing Desk", cat: "cat-2", serial: "SN-DSK1187", acq: "2022-12-05", cost: 15500, cond: "Good", loc: "HQ - 1F", shared: 0, status: "Retired", alloc_type: null, alloc_id: null, exp_return: null },
      { id: "ast-8", tag: "AF-0008", name: "MacBook Pro 14\"", cat: "cat-1", serial: "SN-99871", acq: "2025-02-18", cost: 189000, cond: "Excellent", loc: "HQ - 3F", shared: 0, status: "Allocated", alloc_type: "employee", alloc_id: "emp-6", exp_return: "2026-07-06" },
    ];

    for (const asset of assets) {
      await db.run(
        `INSERT OR IGNORE INTO assets (id, tag, name, category_id, serial, acquisition_date, cost, condition, location, shared, status, allocated_to_type, allocated_to_id, expected_return)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [asset.id, asset.tag, asset.name, asset.cat, asset.serial, asset.acq, asset.cost, asset.cond, asset.loc, asset.shared, asset.status, asset.alloc_type, asset.alloc_id, asset.exp_return]
      );
    }

    console.log("✓ Database seeded with initial data");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
};

db.initialize();
await seedData();
console.log("✓ Seeding complete");
process.exit(0);
