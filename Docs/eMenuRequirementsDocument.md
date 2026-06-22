# **eMenu - Requirements Document**

## **1. Purpose of the App**

eMenu is a digital restaurant management platform that enables customers to browse menus, place orders, and track order status using QR codes, while helping restaurant owners manage orders, menus, inventory, staff, accounting, and business operations from a centralized dashboard.

### **Primary Goals**

* Eliminate paper menus.
* Reduce waiter dependency for order taking.
* Improve order accuracy.
* Provide real-time order tracking.
* Automate restaurant accounting and reporting.
* Increase operational efficiency and customer satisfaction.

# **2. Main Features (Restaurant Owner / Paying User Perspective)**

The paying customer of the platform is the restaurant/hotel owner.

### **Restaurant Management**

* Create restaurant profile
* Manage branches
* Configure table layouts
* Generate QR codes for tables

### **Menu Management**

* Create categories
* Add/Edit/Delete food items
* Upload food images
* Set pricing
* Set preparation time
* Mark items as available/unavailable

### **Order Management**

* Receive customer orders
* Update order status
* Assign orders to kitchen
* View order history

### **Accounting**

* Daily sales report
* Monthly sales report
* Expense tracking
* Profit calculation
* Tax reporting

### **Customer Experience**

* Digital menu access
* Real-time order tracking
* Estimated preparation time

### **Analytics**

* Best-selling items
* Peak business hours
* Revenue trends
* Customer order trends

# **3. Main Features (Reviewer / Helper Perspective)**

Reviewer/Helper can refer to restaurant staff such as managers, supervisors, accountants, or auditors.

### **Features**

* Review orders
* Monitor order statuses
* View accounting reports
* Review customer feedback
* Monitor restaurant performance
* View inventory consumption reports
* Generate reports for management

### **Restrictions**

* Cannot modify critical settings
* Cannot delete restaurant data
* Cannot manage subscriptions

# **4. Main Features (Admin Perspective)**

System Administrator (Platform Owner)

### **User Management**

* Create restaurants
* Suspend restaurants
* Manage subscriptions
* Manage restaurant accounts

### **Platform Management**

* Manage system settings
* Manage pricing plans
* Monitor platform health
* View usage analytics

### **Security**

* User access management
* Audit logs
* Data backup management
* Security monitoring

### **Support**

* Manage support tickets
* View system reports

# **5. Other Users and Their Responsibilities**

| **User Type** | **Responsibilities** |
| --- | --- |
| Customer | Browse menu, place order, track order |
| Waiter | Assist customers, manage table orders |
| Kitchen Staff | View and prepare orders |
| Cashier | Manage payments and invoices |
| Manager | Oversee restaurant operations |
| Accountant | Review sales and expenses |
| Restaurant Owner | Full restaurant management |
| Platform Admin | Manage entire platform |

# **6. Permissions Matrix**

| **Feature** | **Customer** | **Waiter** | **Kitchen** | **Cashier** | **Manager** | **Owner** | **Platform Admin** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| View Menu | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Place Order | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| View Order Status | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Update Order Status | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Manage Menu | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| View Reports | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Manage Expenses | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Manage Staff | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Manage Subscription | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| System Settings | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

# **7. Typical Success Paths**

## **Customer**

1. Scan QR Code
2. Open digital menu
3. Select items
4. Place order
5. Receive order confirmation
6. Track order status
7. Receive food
8. Complete payment

## **Kitchen Staff**

1. Receive order
2. Accept order
3. Start preparation
4. Mark ready
5. Notify waiter/customer

## **Waiter**

1. Receive ready notification
2. Deliver food
3. Complete order

## **Owner**

1. Create menu
2. Generate QR codes
3. Receive orders
4. Track sales
5. Review reports

# **8. Dashboard Views**

## **Customer**

* Current order status
* Estimated delivery/preparation time
* Order history

## **Waiter**

* Active tables
* Pending orders
* Ready orders

## **Kitchen Staff**

* Incoming orders
* Orders in preparation
* Completed orders

## **Cashier**

* Pending payments
* Today's revenue
* Transaction history

## **Manager**

* Daily sales
* Active orders
* Staff performance

## **Owner**

* Revenue summary
* Orders summary
* Popular items
* Expenses
* Profit overview

## **Platform Admin**

* Total restaurants
* Active subscriptions
* Revenue
* Support tickets
* Platform analytics

# **9. Background Content, Data & Work Required**

## **Initial Setup**

* Restaurant profile setup
* Branch setup
* Table creation
* QR code generation

## **Content Preparation**

* Food categories
* Food item details
* Food descriptions
* Food images
* Pricing information
* Preparation times

## **Business Data**

* Tax configuration
* Currency settings
* Expense categories
* Staff accounts

## **Technical Background Tasks**

* Notification service
* Real-time order updates
* Report generation
* Automated backups

# **10. Pricing Scheme**

### **Business Model**

**B2B SaaS (Business-to-Business Software as a Service)**

Restaurant owners pay subscription fees.

### **Suggested Plans**

| **Plan** | **Monthly Price** | **Features** |
| --- | --- | --- |
| Starter | $15/month | Single branch |
| Professional | $49/month | Multi-branch |
| Enterprise | Custom | Unlimited branches |

Additional revenue options:

* SMS notifications
* Premium analytics
* White-label solution
* Custom integrations

# **11. Look and Feel**

### **Design Style**

* Modern
* Clean
* Mobile-first
* Fast-loading

### **Theme**

* Restaurant-focused
* Professional
* Minimalist

### **Colors**

* White background
* Dark text
* Warm accent colors (orange/red)

### **UX Principles**

* One-click ordering
* Minimal navigation
* Large touch-friendly buttons
* Responsive design

# **12. Special Admin Capabilities**

### **Restaurant Owner Admin**

* Generate QR codes
* Bulk menu import/export
* Real-time order monitoring
* Revenue tracking
* Expense tracking
* User management
* Branch management
* Discount management
* Tax management

### **Platform Super Admin**

* Manage all restaurants
* Subscription control
* Platform-wide analytics
* System maintenance mode
* Audit logs
* Data recovery tools

# **13. Known Constraints & Outstanding Issues**

### **Constraints**

* Requires internet connectivity
* Mobile device required for customers
* Real-time updates require stable network

### **Outstanding Decisions**

* Payment gateway integration
* Multi-language support
* Offline mode support
* Inventory management scope
* POS integration requirements
* Receipt printing support
* SMS vs Push Notification strategy

### **Risks**

* Poor internet at restaurant
* Incorrect preparation time estimates
* High concurrent orders during peak hours

# **14. Deployment Plan**

## **Environment Flow**

Development → Staging → Production

### **Development**

* Local machine
* Docker environment

### **Staging**

* Cloud test environment
* UAT testing

### **Production**

* AWS / DigitalOcean / Azure
* CI/CD Pipeline

### **Deployment Steps**

1. Code Review
2. Automated Tests
3. Build Process
4. Deploy to Staging
5. Smoke Testing
6. User Acceptance Testing
7. Production Release

### **Smoke Test Checklist**

#### **Customer**

* QR scan works
* Menu loads
* Order submission works
* Order tracking works

#### **Staff**

* Order received
* Status updates work
* Notifications work

#### **Admin**

* Add menu item
* Edit menu item
* Reports generate correctly
* Accounting calculations are accurate

#### **System**

* Authentication works
* Backups work
* Notifications work
* API health check passes

# **15. Preferred Tech Stack & Rules**

## **Frontend**

### **Customer App**

* React
* Next.js

### **Admin Dashboard**

* React
* Next.js
* TypeScript

## **Backend**

* Node.js
* NestJS
* TypeScript

## **Database**

* PostgreSQL

## **Cache**

* Redis

## **Real-Time**

* WebSocket (Socket.IO)

## **Storage**

* AWS S3

## **Authentication**

* JWT
* OAuth (Google Login)

## **Infrastructure**

* Docker
* GitHub Actions
* AWS ECS / DigitalOcean App Platform

## **Rules & Standards**

### **Reliability**

* All APIs must have error handling.
* All critical actions must be logged.

### **Security**

* HTTPS only.
* Passwords encrypted.
* Role-based access control (RBAC).

### **Performance**

* API response under 500ms.
* Dashboard load under 3 seconds.

### **Scalability**

* Multi-tenant architecture.
* Horizontal scaling support.

### **AI/LLM Rule (Future)**

If AI features are added:

* AI-generated recommendations must have fallback logic.
* System must function fully when AI services are unavailable.
* No core business workflow should depend solely on AI.

### **Backup Policy**

* Daily automated backups.
* 30-day backup retention.
* Disaster recovery plan documented.

This specification is sufficient for creating detailed wireframes, database schema, user stories, sprint planning, and development estimation.