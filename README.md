# ProjectYAT

ProjectYAT is a modern, full-stack Learning Management System (LMS) designed to bridge the gap between students and educators. It provides a seamless platform for course discovery, assignment management, and academic progress tracking with a high-performance, premium user interface.

##  Key Features

###  For Students
- **Course Browser**: Explore and filter a wide range of available courses.
- **Student Dashboard**: Track enrolled courses, upcoming assignments, and grades.
- **Unified Profile**: Manage personal information and academic records in a centralized hub.
- **Assignment Submissions**: Securely upload and track the status of course assignments.

###  For Educators
- **Educator Dashboard**: High-level overview of managed courses and student enrollment.
- **Course Studio**: Create, edit, and manage rich course content and descriptions.
- **Student Management**: View student lists, provide feedback, and grade submissions.
- **Resource Management**: Upload and manage assignment questions and educational materials.

###  Core Capabilities
- **Secure Authentication**: Robust student and educator login systems powered by JWT (JSON Web Tokens).
- **Responsive Design**: A fluid, adaptive interface that works perfectly across desktops, tablets, and mobile devices.
- **Modern UI Architecture**: Built with a custom, high-fidelity design system utilizing modern CSS variables and tokens.

---

##  Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Custom CSS Design System (Advanced HSL Variables)
- **Routing**: React Router 7

### Backend
- **Framework**: [Spring Boot 3.2.4](https://spring.io/projects/spring-boot)
- **Language**: Java 17
- **Security**: Spring Security with JWT
- **Database**: MySQL
- **ORM**: Spring Data JPA
- **Documentation**: SpringDoc OpenAPI (Swagger UI)

---

## 📂 Project Structure

```text
YAT/
├── ProjectYAT/          # React Frontend (Vite)
└── ProjectYAT-Backend/  # Spring Boot Backend (Maven)
```

---

##  Getting Started

### Prerequisites
- Node.js (v18+)
- JDK 17
- MySQL Server

### 1. Backend Setup
1. Configure your database credentials in `ProjectYAT-Backend/src/main/resources/application.properties`.
2. Run the SQL scripts located in `ProjectYAT/sql/` to initialize the database.
3. Build and run using Maven:
   ```bash
   cd ProjectYAT-Backend
   mvn spring-boot:run
   ```

### 2. Frontend Setup
1. Install dependencies:
   ```bash
   cd ProjectYAT
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

---

##  Support & Contact

For any inquiries or feedback regarding ProjectYAT, please visit our **Contact Us** page within the application or reach out to the development team.
