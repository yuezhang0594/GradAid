# GradAid - Product Requirements Document (PRD)
**Version 1.2**
**Last Updated: 2025-03-03**
**Document Owner: jirissman**

## Table of Contents
1. [Product Vision](#product-vision)
2. [Personas](#personas)
3. [User Scenarios](#user-scenarios)
4. [Product Requirements](#product-requirements)
5. [Technical Architecture](#technical-architecture)
6. [File Structure](#file-structure)
7. [Convex Guidelines](#convex-guidelines)
8. [Component Specifications](#component-specifications)
9. [API Documentation](#api-documentation)
10. [Data Models](#data-models)
11. [UI/UX Guidelines](#uiux-guidelines)
12. [Development Standards](#development-standards)
13. [Testing Requirements](#testing-requirements)
14. [Release Criteria](#release-criteria)

## Product Vision
For international students planning to attend graduate school in the US who need to draft documentation required for their applications. GradAid is an AI Driven Service Provider that provides students with freedom to be creative and tailor stories to their individual needs at a low-cost. Unlike educational consultancies, our product is available to users at any time and at a lower cost.

## Personas
### Persona 1 - Li Lei
Li Lei, age 24, is a Chinese graduate student completing his MS degree in Biomedical Science. Originally from China, he earned his bachelor's degree in Chemistry before pursuing his master's studies. Li is passionate about scientific research and is determined to pursue a PhD in the United States to further his academic career. Despite his strong research background, he struggles with academic writing in English and is unfamiliar with the specific expectations of U.S. graduate applications. Li hopes to craft compelling Statements of Purpose (SOPs) and Letters of Recommendation (LORs) that effectively showcase his research achievements and align with his PhD aspirations. He views GradAid as an essential tool to generate professional, grammatically accurate documents tailored to his needs while helping him refine his tone and clarity for a natural-sounding application.

### Persona 2 - Astha Jain
Astha Jain, a 28-year-old from Jaipur, India, comes from a large family and was the first to attend college. She pursued her passion for medicine at Mahatma Gandhi University of Medical Sciences and Technology, earning a Bachelor of Medicine and Bachelor of Surgery (MBBS) degree with high marks. Although she initially aspired to become a surgeon, she faced challenges finding employment immediately after graduation. Relocating to New Delhi in search of opportunities, she worked as a server to support herself while continuing her job search. Eventually, she secured a position as a junior doctor at a family medicine practice, where she worked for two years until the practice closed due to financial difficulties. Following this setback, she accepted a nursing position at Jeewan Mala Hospital in New Delhi. This career detour, coupled with the demanding hours of her new role, has prompted her to re-evaluate her career path. She now plans to pursue a graduate degree in a growing and more lucrative field, such as computer science or finance. Having saved enough money to study in the United States, she hopes that a graduate degree from a top American university will open doors to high-paying jobs, enabling her to support her aging parents, whose ability to work is diminishing.

### Persona 3 - Carlos Mendoza
Carlos Mendoza, age 26, is a software engineer from Mexico City with four years of experience in backend development. He earned his bachelor's degree in Computer Science from UNAM and has worked at a mid-sized tech company. Carlos has always been passionate about AI and machine learning and wants to pivot into research, but his current job focuses more on software development rather than deep AI work.
He plans to apply for an MS in Artificial Intelligence in the United States to gain the necessary academic background to transition into AI research roles. However, he is unfamiliar with the research-heavy SOPs required for graduate applications and has limited experience writing formal academic documents in English. He is also unsure how to best frame his work experience to demonstrate its relevance to AI research. He hopes GradAid will help him craft a strong SOP that highlights his technical background while showcasing his research potential in AI.

## User Scenarios
### Scenario 1 - Li Lei
Li Lei, a 24-year-old Chinese graduate student completing his MS in Biomedical Science, is preparing to apply for PhD programs in the United States. With a BS in Chemistry and extensive research experience, he is eager to continue his academic journey in biomedical innovation. However, he faces significant challenges in crafting a compelling application due to his limited English proficiency and unfamiliarity with the tone, structure, and expectations of U.S. graduate admissions. Writing a strong Statement of Purpose (SOP) and securing well-crafted Letters of Recommendation (LORs) feels overwhelming, as he struggles to articulate his research achievements and career goals in a way that resonates with admissions committees.

To overcome these challenges, Li turns to GradAid, which helps him generate well-structured, grammatically accurate SOPs and LORs tailored to his background and aspirations. By inputting key details about his academic journey and research experience, he receives personalized drafts that he can refine using GradAid's tone adjustment and clarity-enhancing features. The platform also provides research-focused suggestions to ensure his documents align with the expectations of specific PhD programs. With GradAid's support, Li gains confidence in his application, knowing that his materials effectively highlight his strengths and are presented in a professional, natural-sounding manner.

### Scenario 2 - Astha Jain
Astha is determined to pursue a graduate degree in the US, but the application process feels overwhelming. Remembering a friend's recommendation, she opens her browser and navigates to GradAid.com. Astha clicks the "Get Started" button and begins interacting with GradAid's AI chatbot.

GradAid asks her a series of questions: her background, academic achievements, work experience, career aspirations, and preferred fields of study. Astha appreciates how GradAid's conversational interface makes it easy to share her story, even the less conventional parts. She explains her medical background, her shift to nursing, and her desire to transition into a more lucrative and stable career to support her parents. Based on Astha's input, GradAid's AI analyzes her profile and generates a list of potential graduate programs in computer science and finance at universities across the US. The recommendations are tailored to her academic record, work history, and career goals. Astha is impressed by the breadth and relevance of the suggestions.

Astha selects a few programs that pique her interest. She knows the Statement of Purpose (SOP) is crucial, and it's where she's been struggling the most. Thankfully, GradAid offers an SOP brainstorming tool. GradAid's AI generates a series of prompts and potential themes for her SOP, suggesting ways to connect her seemingly disparate experiences into a cohesive narrative. Astha finds this incredibly helpful, as she's able to recognize the transferable skills she's gained, like problem-solving, communication, and adaptability.

### Scenario 3 - Carlos Mendoza
Carlos has started drafting his Statement of Purpose (SOP) for MS programs in AI, but he's struggling to connect his industry experience in backend development to his passion for machine learning. Unsure of how to frame his background, he logs into GradAid and inputs details about his education, work experience, and research interests.

GradAid analyzes his profile and suggests ways to highlight transferable skills from his software engineering background, such as his experience working with large datasets, optimization algorithms, and distributed computing. The AI-generated SOP draft weaves his technical experience into a compelling narrative, emphasizing how his work has naturally led him toward AI research. The platform also offers AI-powered editing tools to refine the language, ensuring his SOP is both professional and persuasive.

### Scenario 4 - Carlos Mendoza
Carlos has shortlisted five MS programs in AI, each with slightly different focuses—some emphasize research, while others are more industry-oriented. He wants to tailor his SOP for each program but doesn't know how to efficiently modify his content.

Using GradAid's customization feature, he selects the target programs and receives program-specific suggestions for refining his SOP. The tool highlights key faculty members and research labs he should mention, recommends how to emphasize certain skills based on each program's focus, and adjusts the wording to align with the expectations of research vs. industry-focused programs. With GradAid's help, Carlos creates tailored versions of his SOP, increasing his chances of securing admission.

## Product Requirements
### Must Have – minimal for release, required for a useful product

| Feature | User Story | Persona or Scenario | Technical Requirements |
|---------|------------|---------------------|------------------------|
| Interactive form to collect user information and store in a database. | As an aspiring graduate student, I need to provide information about myself through an interactive form. | All personas and scenarios | - Form must capture academic history, work experience, achievements, skills, and career goals<br>- Progressive form with multi-step validation<br>- Form state must persist between sessions<br>- Data should be stored in Convex database with appropriate schema |
| User authentication. | As a multi-device user, I need to log in so that my activity and history are saved and synchronized across all devices. | Basic feature for all web applications | - Authentication via Clerk with email/password and OAuth options (Google, GitHub)<br>- Account verification via email<br>- Session management through Clerk SDK<br>- Password reset functionality |
| Customized SOP generation, specific to university requirements. | As an applicant applying to many graduate programs, I need automated document creation based on my university choice. | Astha's scenario | - University database with program-specific requirements<br>- AI prompting system that incorporates university-specific details<br>- Document template system with dynamic sections<br>- Ability to generate multiple variations for different programs |
| Customized SOP generation, specific to user information. | As a mid-career professional seeking a graduate degree abroad, I need to have my diverse background and skillset reflected in my SOP. | Astha's scenario | - AI model integration for personalized content generation<br>- Natural language processing for coherent narrative creation<br>- Tone and style adjustment features<br>- Skill mapping algorithm to highlight relevant experiences |
| Cross-platform support. | As a global applicant with limited internet access, I need to interact with GradAid in a web browser on my phone. | Global accessibility requirement | - Responsive design using Tailwind CSS<br>- Progressive Web App (PWA) features<br>- Optimized asset loading for slow connections<br>- Offline capability for document editing |
| User authentication and data security (RBAC, OAuth, etc.) | As a privacy-conscious user, I need data encryption and security measures so that my personal information is protected. | Common security concern | - HTTPS implementation<br>- Data encryption at rest and in transit<br>- GDPR and CCPA compliance measures<br>- Clerk's role-based access control<br>- Regular security audits |

### Want to Have – improves on a required feature or additional functionality

| Feature | User Story | Persona or Scenario | Technical Requirements |
|---------|------------|---------------------|------------------------|
| Document management system. | As an applicant needing to update my application materials, I want to quickly find my relevant documents. | Returning user scenario | - Document versioning system<br>- Search functionality with metadata filtering<br>- Folder/tag organization structure<br>- Export options (PDF, DOCX, TXT) |
| Document formatting tools. | As an applicant preparing documents for various universities, I want to specify the format of downloaded documents. | All personas | - Template system with university-specific formatting<br>- Typography and layout controls<br>- Export format options with preview<br>- APA/MLA/Chicago style adherence options |
| Application tracking system. | As an applicant managing multiple university applications, I want a system for tracking application deadlines. | Li's persona | - Calendar integration<br>- Notification system (email, in-app)<br>- Status tracking workflow<br>- Timeline visualization |
| Application tracking system. | As someone that struggles with organization, I want a feature for tracking the progress of my applications. | Astha's persona | - Kanban-style application board<br>- Checklist functionality for application requirements<br>- Progress indicators and metrics<br>- Note-taking capabilities for each application |
| Program search. | As a prospective graduate student, I want to interactively search through university programs and save them to a personalized list. | Carlos' persona | - University and program database<br>- Advanced search filters (location, specialization, ranking, etc.)<br>- Comparison tool for multiple programs<br>- Save/favorite functionality with custom lists |

### Nice to Have – things to do if there is time

| Feature | User Story | Persona or Scenario | Technical Requirements |
|---------|------------|---------------------|------------------------|
| Speech-to-text and text-to-speech. | As an applicant with accessibility needs, I want GradAid to have speech recognition and speech generation capabilities. | Accessibility requirement | - Integration with Web Speech API<br>- Voice command functionality<br>- Text-to-speech for document review<br>- Language and accent detection |
| UI/UX design and testing. | As a user with limited computer literacy, I want the GradAid website to be inviting with a modern design. | Astha's persona | - Usability testing framework<br>- A/B testing for UI elements<br>- User session recording and analytics<br>- Iterative design process based on feedback |
| AI-power document updates. | As someone who has gained a new qualification, I want to be able to update my SOPs and LORs to include new accomplishments. | Carlos' persona | - Intelligent document comparison<br>- Suggestion system for document improvements<br>- Automatic update recommendations<br>- Version control and history tracking |
| University shortlisting. | As a prospective graduate student, I want to receive a shortlist of universities based on my experience and accomplishments. | Astha's scenario | - Recommendation algorithm based on user profile<br>- Acceptance probability estimation<br>- Program matching based on research interests<br>- Geographic and financial considerations |

## Technical Architecture

### Architecture Overview
GradAid employs a modern, modular architecture designed for maintainability, scalability, and flexibility. The system consists of several key components, each with specific responsibilities:

#### Frontend Architecture
Built with **React** and **Vite** for fast rendering and development experience, the frontend includes:
- **Document Editor**: Rich-text editing interface for SOPs and LORs using Shadcn components
- **User Dashboard**: Displays saved documents and application insights
- **Auth & Profile**: Manages user authentication and profile settings using Clerk
- **Convex Client**: Facilitates real-time communication with the backend
- **React Router**: Handles client-side routing with nested routes and navigation

#### Backend Architecture
Powered by **Convex** for serverless backend functionality:
- **Document Generation API**: AI-powered SOP/LOR generation services
- **User Management**: Authentication, user data, and session tracking
- **Database Integration**: Stores and retrieves user data and documents

#### Styling and UI Components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Shadcn**: Component library providing consistent UI elements across the application
- **Lucide**: Icon library providing consistent, customizable SVG icons throughout the interface
- **Framer Motion**: Animation library for fluid, performant UI transitions and interactions

#### Data Flow Architecture
GradAid follows a client-server architecture with real-time capabilities:
- Frontend React components communicate with Convex backend using the Convex client
- Convex handles data persistence and business logic
- Real-time updates push changes to the client without requiring page refreshes

#### Dependency Management
The system minimizes coupling between components through:
- **Component-Based Design**: Modular React components with clearly defined responsibilities
- **API Abstraction**: Consistent interfaces between frontend and backend services
- **State Management**: Clean separation of UI state and application data

#### Development Tools
- **TypeScript**: Type safety and improved developer experience
- **ESLint**: Code quality and consistency enforcement
- **npm-run-all**: Parallel execution of development processes
- **Vite**: Fast development server and optimized builds

#### Deployment and Scalability
- **Frontend**: Deployed as a static site with dynamic capabilities
- **Backend**: Leverages Convex's serverless infrastructure for auto-scaling
- **Database**: Utilizes Convex's built-in database for document storage and retrieval

### System Interaction Diagram
```
┌─────────────┐     HTTP/WebSocket    ┌─────────────┐
│             │◄─────────────────────►│             │
│  Frontend   │                       │   Convex    │
│  (React)    │                       │  Backend    │
│             │                       │             │
└─────┬───────┘                       └─────┬───────┘
      │                                     │
      │                                     │
┌─────▼───────┐                       ┌─────▼───────┐
│             │                       │             │
│   Browser   │                       │   Convex    │
│  Storage    │                       │  Database   │
│             │                       │             │
└─────────────┘                       └─────────────┘
```

## File Structure
Below is the complete file structure for GradAid with detailed explanations for key files and directories:

```
GradAid/
├── README.md                            # Project overview, setup instructions
├── components.json                      # Shadcn component configurations
├── convex/                              # Backend serverless functions
│   ├── README.md                        # Backend documentation
│   ├── _generated/                      # Auto-generated Convex types
│   ├── auth.config.ts                   # Authentication configuration
│   ├── auth.ts                          # Authentication functions
│   ├── errors.ts                        # Error handling utilities
│   ├── helpers.ts                       # Helper functions
│   ├── http.ts                          # HTTP endpoint handlers
│   ├── documents/                       # Document-related functions
│   │   ├── create.ts                    # Document creation logic
│   │   ├── update.ts                    # Document update logic
│   │   ├── generate.ts                  # AI document generation
│   │   └── format.ts                    # Document formatting utilities
│   ├── universities/                    # University data functions
│   │   ├── search.ts                    # University search functionality
│   │   └── recommendations.ts           # Program recommendation logic
│   ├── users/                           # User-related functions
│   │   ├── profile.ts                   # User profile management
│   │   └── preferences.ts               # User preferences handling
│   ├── applications/                    # Application tracking functions
│   │   ├── create.ts                    # Application creation
│   │   ├── update.ts                    # Status update logic
│   │   └── deadlines.ts                 # Deadline management
│   ├── schema.ts                        # Database schema definitions
│   └── tsconfig.json                    # TypeScript configuration for backend
├── src/                                 # Frontend source code
│   ├── routes/                      # Application routes
│   │   ├── index.tsx                # Main routing configuration
│   │   ├── auth/                    # Authentication routes handled by Clerk
│   │   │   ├── sign-in.tsx          # Clerk sign-in page
│   │   │   ├── sign-up.tsx          # Clerk registration page
│   │   │   └── reset-password.tsx   # Clerk password reset page
│   │   ├── dashboard/               # Dashboard routes
│   │   │   ├── index.tsx            # Main dashboard page
│   │   │   ├── documents.tsx        # Documents listing page
│   │   │   └── applications.tsx     # Applications tracking page
│   │   └── editor/                  # Document editor routes
│   │       ├── index.tsx            # Document listing
│   │       ├── [documentId].tsx     # Document editor page
│   │       └── new.tsx              # New document page
│   ├── components/                  # Reusable components
│   │   ├── common/                  # Common UI components
│   │   │   ├── Button.tsx           # Button component
│   │   │   ├── Card.tsx             # Card component
│   │   │   ├── Input.tsx            # Form input component
│   │   │   └── Modal.tsx            # Modal dialog component
│   │   ├── layout/                  # Layout components
│   │   │   ├── Header.tsx           # Header component
│   │   │   ├── Footer.tsx           # Footer component
│   │   │   ├── Sidebar.tsx          # Sidebar navigation
│   │   │   └── Layout.tsx           # Main layout wrapper
│   │   ├── editor/                  # Editor-specific components
│   │   │   ├── RichTextEditor.tsx   # Rich text editor
│   │   │   ├── FormatControls.tsx   # Text formatting controls
│   │   │   └── AIAssistant.tsx      # AI writing assistant
│   │   └── dashboard/               # Dashboard-specific components
│   │       ├── DocumentCard.tsx     # Document card component
│   │       ├── ApplicationCard.tsx  # Application card component
│   │       └── StatusBadge.tsx      # Status indicator badge
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts               # Clerk authentication hook
│   │   ├── useDocuments.ts          # Document management hook
│   │   ├── useUniversities.ts       # University data hook
│   │   └── useApplications.ts       # Application tracking hook
│   ├── utils/                       # Utility functions
│   │   ├── api.ts                   # API interaction utilities
│   │   ├── formatting.ts            # Text formatting helpers
│   │   ├── validation.ts            # Form validation functions
│   │   └── dates.ts                 # Date manipulation utilities
│   ├── store/                       # State management
│   │   ├── index.ts                 # Store configuration
│   │   ├── authSlice.ts             # Authentication state
│   │   ├── documentSlice.ts         # Document state
│   │   └── applicationSlice.ts      # Application tracking state
│   ├── types/                       # TypeScript type definitions
│   │   ├── document.ts              # Document-related types
│   │   ├── user.ts                  # User-related types
│   │   ├── university.ts            # University-related types
│   │   └── application.ts           # Application-related types
│   ├── assets/                          # Static assets
│   │   └── images/                      # Image files
│   ├── App.tsx                          # Main App component
│   ├── main.tsx                         # Application entry point
│   └── vite-env.d.ts                    # Vite environment types
├── public/                              # Public assets
├── eslint.config.js                     # ESLint configuration
├── netlify.toml                         # Netlify deployment config
├── package.json                         # NPM package definition
├── tsconfig.json                        # TypeScript configuration
└── vite.config.ts                       # Vite configuration
```



# Convex guidelines
## Function guidelines
### New function syntax
- ALWAYS use the new function syntax for Convex functions. For example:
      ```typescript
      import { query } from "./_generated/server";
      import { v } from "convex/values";
      export const f = query({
          args: {},
          returns: v.null(),
          handler: async (ctx, args) => {
          // Function body
          },
      });
      ```

### Http endpoint syntax
- HTTP endpoints are defined in `convex/http.ts` and require an `httpAction` decorator. For example:
      ```typescript
      import { httpRouter } from "convex/server";
      import { httpAction } from "./_generated/server";
      const http = httpRouter();
      http.route({
          path: "/echo",
          method: "POST",
          handler: httpAction(async (ctx, req) => {
          const body = await req.bytes();
          return new Response(body, { status: 200 });
          }),
      });
      ```
- HTTP endpoints are always registered at the exact path you specify in the `path` field. For example, if you specify `/api/someRoute`, the endpoint will be registered at `/api/someRoute`.

### Validators
- Below is an example of an array validator:
                            ```typescript
                            import { mutation } from "./_generated/server";
                            import { v } from "convex/values";

                            export default mutation({
                            args: {
                                simpleArray: v.array(v.union(v.string(), v.number())),
                            },
                            handler: async (ctx, args) => {
                                //...
                            },
                            });
                            ```
- Below is an example of a schema with validators that codify a discriminated union type:
                            ```typescript
                            import { defineSchema, defineTable } from "convex/server";
                            import { v } from "convex/values";

                            export default defineSchema({
                                results: defineTable(
                                    v.union(
                                        v.object({
                                            kind: v.literal("error"),
                                            errorMessage: v.string(),
                                        }),
                                        v.object({
                                            kind: v.literal("success"),
                                            value: v.number(),
                                        }),
                                    ),
                                )
                            });
                            ```
- Always use the `v.null()` validator when returning a null value. Below is an example query that returns a null value:
                                  ```typescript
                                  import { query } from "./_generated/server";
                                  import { v } from "convex/values";

                                  export const exampleQuery = query({
                                    args: {},
                                    returns: v.null(),
                                    handler: async (ctx, args) => {
                                        console.log("This query returns a null value");
                                        return null;
                                    },
                                  });
                                  ```
- Here are the valid Convex types along with their respective validators:
 Convex Type  | TS/JS type  |  Example Usage         | Validator for argument validation and schemas  | Notes                                                                                                                                                                                                 |
| ----------- | ------------| -----------------------| -----------------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Id          | string      | `doc._id`              | `v.id(tableName)`                              |                                                                                                                                                                                                       |
| Null        | null        | `null`                 | `v.null()`                                     | JavaScript's `undefined` is not a valid Convex value. Functions the return `undefined` or do not return will return `null` when called from a client. Use `null` instead.                             |
| Int64       | bigint      | `3n`                   | `v.int64()`                                    | Int64s only support BigInts between -2^63 and 2^63-1. Convex supports `bigint`s in most modern browsers.                                                                                              |
| Float64     | number      | `3.1`                  | `v.number()`                                   | Convex supports all IEEE-754 double-precision floating point numbers (such as NaNs). Inf and NaN are JSON serialized as strings.                                                                      |
| Boolean     | boolean     | `true`                 | `v.boolean()`                                  |
| String      | string      | `"abc"`                | `v.string()`                                   | Strings are stored as UTF-8 and must be valid Unicode sequences. Strings must be smaller than the 1MB total size limit when encoded as UTF-8.                                                         |
| Bytes       | ArrayBuffer | `new ArrayBuffer(8)`   | `v.bytes()`                                    | Convex supports first class bytestrings, passed in as `ArrayBuffer`s. Bytestrings must be smaller than the 1MB total size limit for Convex types.                                                     |
| Array       | Array       | `[1, 3.2, "abc"]`      | `v.array(values)`                              | Arrays can have at most 8192 values.                                                                                                                                                                  |
| Object      | Object      | `{a: "abc"}`           | `v.object({property: value})`                  | Convex only supports "plain old JavaScript objects" (objects that do not have a custom prototype). Objects can have at most 1024 entries. Field names must be nonempty and not start with "$" or "_". |
| Record      | Record      | `{"a": "1", "b": "2"}` | `v.record(keys, values)`                       | Records are objects at runtime, but can have dynamic keys. Keys must be only ASCII characters, nonempty, and not start with "$" or "_".                                                               |

### Function registration
- Use `internalQuery`, `internalMutation`, and `internalAction` to register internal functions. These functions are private and aren't part of an app's API. They can only be called by other Convex functions. These functions are always imported from `./_generated/server`.
- Use `query`, `mutation`, and `action` to register public functions. These functions are part of the public API and are exposed to the public Internet. Do NOT use `query`, `mutation`, or `action` to register sensitive internal functions that should be kept private.
- You CANNOT register a function through the `api` or `internal` objects.
- ALWAYS include argument and return validators for all Convex functions. This includes all of `query`, `internalQuery`, `mutation`, `internalMutation`, `action`, and `internalAction`. If a function doesn't return anything, include `returns: v.null()` as its output validator.
- If the JavaScript implementation of a Convex function doesn't have a return value, it implicitly returns `null`.

### Function calling
- Use `ctx.runQuery` to call a query from a query, mutation, or action.
- Use `ctx.runMutation` to call a mutation from a mutation or action.
- Use `ctx.runAction` to call an action from an action.
- ONLY call an action from another action if you need to cross runtimes (e.g. from V8 to Node). Otherwise, pull out the shared code into a helper async function and call that directly instead.
- Try to use as few calls from actions to queries and mutations as possible. Queries and mutations are transactions, so splitting logic up into multiple calls introduces the risk of race conditions.
- All of these calls take in a `FunctionReference`. Do NOT try to pass the callee function directly into one of these calls.
- When using `ctx.runQuery`, `ctx.runMutation`, or `ctx.runAction` to call a function in the same file, specify a type annotation on the return value to work around TypeScript circularity limitations. For example,
                            ```
                            export const f = query({
                              args: { name: v.string() },
                              returns: v.string(),
                              handler: async (ctx, args) => {
                                return "Hello " + args.name;
                              },
                            });

                            export const g = query({
                              args: {},
                              returns: v.null(),
                              handler: async (ctx, args) => {
                                const result: string = await ctx.runQuery(api.example.f, { name: "Bob" });
                                return null;
                              },
                            });
                            ```

### Function references
- Function references are pointers to registered Convex functions.
- Use the `api` object defined by the framework in `convex/_generated/api.ts` to call public functions registered with `query`, `mutation`, or `action`.
- Use the `internal` object defined by the framework in `convex/_generated/api.ts` to call internal (or private) functions registered with `internalQuery`, `internalMutation`, or `internalAction`.
- Convex uses file-based routing, so a public function defined in `convex/example.ts` named `f` has a function reference of `api.example.f`.
- A private function defined in `convex/example.ts` named `g` has a function reference of `internal.example.g`.
- Functions can also registered within directories nested within the `convex/` folder. For example, a public function `h` defined in `convex/messages/access.ts` has a function reference of `api.messages.access.h`.

### Api design
- Convex uses file-based routing, so thoughtfully organize files with public query, mutation, or action functions within the `convex/` directory.
- Use `query`, `mutation`, and `action` to define public functions.
- Use `internalQuery`, `internalMutation`, and `internalAction` to define private, internal functions.

### Pagination
- Paginated queries are queries that return a list of results in incremental pages.
- You can define pagination using the following syntax:

                            ```ts
                            import { v } from "convex/values";
                            import { query, mutation } from "./_generated/server";
                            import { paginationOptsValidator } from "convex/server";
                            export const listWithExtraArg = query({
                                args: { paginationOpts: paginationOptsValidator, author: v.string() },
                                handler: async (ctx, args) => {
                                    return await ctx.db
                                    .query("messages")
                                    .filter((q) => q.eq(q.field("author"), args.author))
                                    .order("desc")
                                    .paginate(args.paginationOpts);
                                },
                            });
                            ```
                            Note: `paginationOpts` is an object with the following properties:
                            - `numItems`: the maximum number of documents to return (the validator is `v.number()`)
                            - `cursor`: the cursor to use to fetch the next page of documents (the validator is `v.union(v.string(), v.null())`)
- A query that ends in `.paginate()` returns an object that has the following properties:
                            - page (contains an array of documents that you fetches)
                            - isDone (a boolean that represents whether or not this is the last page of documents)
                            - continueCursor (a string that represents the cursor to use to fetch the next page of documents)


## Validator guidelines
- `v.bigint()` is deprecated for representing signed 64-bit integers. Use `v.int64()` instead.
- Use `v.record()` for defining a record type. `v.map()` and `v.set()` are not supported.

## Schema guidelines
- Always define your schema in `convex/schema.ts`.
- Always import the schema definition functions from `convex/server`:
- System fields are automatically added to all documents and are prefixed with an underscore. The two system fields that are automatically added to all documents are `_creationTime` which has the validator `v.number()` and `_id` which has the validator `v.id(tableName)`.
- Always include all index fields in the index name. For example, if an index is defined as `["field1", "field2"]`, the index name should be "by_field1_and_field2".
- Index fields must be queried in the same order they are defined. If you want to be able to query by "field1" then "field2" and by "field2" then "field1", you must create separate indexes.

## Typescript guidelines
- You can use the helper typescript type `Id` imported from './_generated/dataModel' to get the type of the id for a given table. For example if there is a table called 'users' you can use `Id<'users'>` to get the type of the id for that table.
- If you need to define a `Record` make sure that you correctly provide the type of the key and value in the type. For example a validator `v.record(v.id('users'), v.string())` would have the type `Record<Id<'users'>, string>`. Below is an example of using `Record` with an `Id` type in a query:
                    ```ts
                    import { query } from "./_generated/server";
                    import { Doc, Id } from "./_generated/dataModel";

                    export const exampleQuery = query({
                        args: { userIds: v.array(v.id("users")) },
                        returns: v.record(v.id("users"), v.string()),
                        handler: async (ctx, args) => {
                            const idToUsername: Record<Id<"users">, string> = {};
                            for (const userId of args.userIds) {
                                const user = await ctx.db.get(userId);
                                if (user) {
                                    users[user._id] = user.username;
                                }
                            }

                            return idToUsername;
                        },
                    });
                    ```
- Be strict with types, particularly around id's of documents. For example, if a function takes in an id for a document in the 'users' table, take in `Id<'users'>` rather than `string`.
- Always use `as const` for string literals in discriminated union types.
- When using the `Array` type, make sure to always define your arrays as `const array: Array<T> = [...];`
- When using the `Record` type, make sure to always define your records as `const record: Record<KeyType, ValueType> = {...};`
- Always add `@types/node` to your `package.json` when using any Node.js built-in modules.

## Full text search guidelines
- A query for "10 messages in channel '#general' that best match the query 'hello hi' in their body" would look like:

const messages = await ctx.db
  .query("messages")
  .withSearchIndex("search_body", (q) =>
    q.search("body", "hello hi").eq("channel", "#general"),
  )
  .take(10);

## Query guidelines
- Do NOT use `filter` in queries. Instead, define an index in the schema and use `withIndex` instead.
- Convex queries do NOT support `.delete()`. Instead, `.collect()` the results, iterate over them, and call `ctx.db.delete(row._id)` on each result.
- Use `.unique()` to get a single document from a query. This method will throw an error if there are multiple documents that match the query.
- When using async iteration, don't use `.collect()` or `.take(n)` on the result of a query. Instead, use the `for await (const row of query)` syntax.
### Ordering
- By default Convex always returns documents in ascending `_creationTime` order.
- You can use `.order('asc')` or `.order('desc')` to pick whether a query is in ascending or descending order. If the order isn't specified, it defaults to ascending.
- Document queries that use indexes will be ordered based on the columns in the index and can avoid slow table scans.


## Mutation guidelines
- Use `ctx.db.replace` to fully replace an existing document. This method will throw an error if the document does not exist.
- Use `ctx.db.patch` to shallow merge updates into an existing document. This method will throw an error if the document does not exist.

## Action guidelines
- Always add `"use node";` to the top of files containing actions that use Node.js built-in modules.
- Never use `ctx.db` inside of an action. Actions don't have access to the database.
- Below is an example of the syntax for an action:
                    ```ts
                    import { action } from "./_generated/server";

                    export const exampleAction = action({
                        args: {},
                        returns: v.null(),
                        handler: async (ctx, args) => {
                            console.log("This action does not return anything");
                            return null;
                        },
                    });
                    ```

## Scheduling guidelines
### Cron guidelines
- Only use the `crons.interval` or `crons.cron` methods to schedule cron jobs. Do NOT use the `crons.hourly`, `crons.daily`, or `crons.weekly` helpers.
- Both cron methods take in a FunctionReference. Do NOT try to pass the function directly into one of these methods.
- Define crons by declaring the top-level `crons` object, calling some methods on it, and then exporting it as default. For example,
                            ```ts
                            import { cronJobs } from "convex/server";
                            import { internal } from "./_generated/api";
                            import { internalAction } from "./_generated/server";

                            const empty = internalAction({
                              args: {},
                              returns: v.null(),
                              handler: async (ctx, args) => {
                                console.log("empty");
                              },
                            });

                            const crons = cronJobs();

                            // Run `internal.crons.empty` every two hours.
                            crons.interval("delete inactive users", { hours: 2 }, internal.crons.empty, {});

                            export default crons;
                            ```
- You can register Convex functions within `crons.ts` just like any other file.
- If a cron calls an internal function, always import the `internal` object from '_generated/api`, even if the internal function is registered in the same file.


## File storage guidelines
- Convex includes file storage for large files like images, videos, and PDFs.
- The `ctx.storage.getUrl()` method returns a signed URL for a given file. It returns `null` if the file doesn't exist.
- Do NOT use the deprecated `ctx.storage.getMetadata` call for loading a file's metadata.

                    Instead, query the `_storage` system table. For example, you can use `ctx.db.system.get` to get an `Id<"_storage">`.
                    ```
                    import { query } from "./_generated/server";
                    import { Id } from "./_generated/dataModel";

                    type FileMetadata = {
                        _id: Id<"_storage">;
                        _creationTime: number;
                        contentType?: string;
                        sha256: string;
                        size: number;
                    }

                    export const exampleQuery = query({
                        args: { fileId: v.id("_storage") },
                        returns: v.null();
                        handler: async (ctx, args) => {
                            const metadata: FileMetadata | null = await ctx.db.system.get(args.fileId);
                            console.log(metadata);
                            return null;
                        },
                    });
                    ```
- Convex storage stores items as `Blob` objects. You must convert all items to/from a `Blob` when using Convex storage.

## Component Specifications

### Document Editor Component

**Purpose:** Provides a rich text editing interface for creating and editing SOPs and LORs.

**Key Functionality:**
- Rich text formatting (bold, italic, headings, lists)
- AI-powered writing suggestions
- Document templates for different application types
- Real-time saving
- Version history

**Example Usage:**
```tsx
// Example of how developers should implement the Document Editor component
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { useDocument } from "@/hooks/useDocuments";

function DocumentEditorPage({ documentId }) {
  const { document, saveDocument, generateAIContent } = useDocument(documentId);
  
  return (
    <div className="document-editor">
      <h1>Edit Your Statement of Purpose</h1>
      <RichTextEditor 
        initialContent={document.content}
        onChange={(content) => saveDocument({...document, content})}
        onRequestAIHelp={(selection) => generateAIContent(selection)}
      />
      <div className="document-actions">
        <button onClick={() => saveDocument(document)}>Save</button>
        <button onClick={() => generateAIContent("full")}>Generate Complete Draft</button>
      </div>
    </div>
  );
}
```

**Expected Response Format:**
```typescript
// Document data structure
interface Document {
  id: string;
  title: string;
  content: string;
  documentType: "SOP" | "LOR" | "CV" | "RESUME";
  targetUniversity?: string;
  targetProgram?: string;
  createdAt: Date;
  updatedAt: Date;
  versions: Array<{
    content: string;
    timestamp: Date;
  }>;
}
```

### University Search Component

**Purpose:** Allows users to search for universities and academic programs.

**Key Functionality:**
- Search by name, location, program type, or ranking
- Filter by acceptance rates, GRE requirements, etc.
- Save favorite programs
- View program details and requirements

**Example Implementation:**
```tsx
// Example of how developers should implement the University Search
import { useState } from "react";
import { useUniversities } from "@/hooks/useUniversities";
import { SearchField } from "@/components/common/SearchField";
import { FilterPanel } from "@/components/universities/FilterPanel";
import { UniversityCard } from "@/components/universities/UniversityCard";

function UniversitySearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    programType: "all",
    location: "all",
    ranking: "all"
  });
  
  const { universities, loading, error } = useUniversities(searchQuery, filters);
  
  return (
    <div className="university-search">
      <h1>Find Your Graduate Program</h1>
      <SearchField 
        value={searchQuery} 
        onChange={setSearchQuery} 
        placeholder="Search universities or programs..." 
      />
      <FilterPanel filters={filters} onChange={setFilters} />
      
      {loading && <div>Loading universities...</div>}
      {error && <div>Error: {error.message}</div>}
      
      <div className="results-grid">
        {universities.map(university => (
          <UniversityCard 
            key={university.id}
            university={university}
            onSave={() => saveToFavorites(university.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

**Expected Data Format:**
```typescript
// University data structure
interface University {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  programs: Array<{
    id: string;
    name: string;
    degree: "MS" | "MA" | "PhD" | "MBA" | "Other";
    department: string;
    requirements: {
      gre: boolean;
      toefl: boolean;
      minimumGPA: number;
      applicationFee: number;
    };
    deadlines: {
      fall: Date | null;
      spring: Date | null;
      summer: Date | null;
    };
    acceptanceRate?: number;
  }>;
  ranking?: number;
  website: string;
}
```

### Application Tracker Component

**Purpose:** Helps users keep track of their application progress across multiple universities.

**Key Functionality:**
- Status tracking (Not Started, In Progress, Submitted, Interview, Accepted, Rejected)
- Deadline reminders
- Document checklist for each application
- Notes and important contacts

**Example Implementation:**
```tsx
// Example of how developers should implement the Application Tracker
import { useState } from "react";
import { useApplications } from "@/hooks/useApplications";
import { ApplicationCard } from "@/components/dashboard/ApplicationCard";
import { StatusFilter } from "@/components/applications/StatusFilter";
import { DeadlineCalendar } from "@/components/applications/DeadlineCalendar";

function ApplicationTrackerPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { applications, updateStatus, addNote } = useApplications(statusFilter);
  
  return (
    <div className="application-tracker">
      <h1>Your Applications</h1>
      <div className="tracker-controls">
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        <button>Add New Application</button>
      </div>
      
      <DeadlineCalendar applications={applications} />
      
      <div className="applications-list">
        {applications.map(application => (
          <ApplicationCard 
            key={application.id}
            application={application}
            onStatusChange={(status) => updateStatus(application.id, status)}
            onAddNote={(note) => addNote(application.id, note)}
          />
        ))}
        {applications.length === 0 && (
          <div className="empty-state">
            No applications matching your filter. Start adding applications to track your progress.
          </div>
        )}
      </div>
    </div>
  );
}
```

**Expected Data Format:**
```typescript
// Application data structure
interface Application {
  id: string;
  universityId: string;
  universityName: string;
  programId: string;
  programName: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "INTERVIEW" | "ACCEPTED" | "REJECTED";
  deadline: Date;
  documents: Array<{
    type: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    documentId?: string;
  }>;
  notes: Array<{
    id: string;
    content: string;
    timestamp: Date;
  }>;
  contacts: Array<{
    name: string;
    role: string;
    email?: string;
    phone?: string;
  }>;
  timeline: Array<{
    event: string;
    date: Date;
  }>;
}
```

## API Documentation

### Convex Backend API

#### User Authentication

**Get Current User:**
```typescript
// convex/users/current.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    // Get Clerk user data
    const userId = identity.subject;
    const email = identity.email;
    const name = identity.name;
    
    // Get or create user in Convex database
    // ...implementation details...
    
    return {
      userId,
      email,
      name,
      // other user data from database
    };
  }
});
```

**Example Request:**
```typescript
import { api } from "../convex/_generated/api";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-react";

// Use Clerk's useAuth hook for authentication status
const { isSignedIn } = useAuth();
// Use Convex query to fetch current user data if signed in
const user = useQuery(api.users.current.getCurrentUser);
```

**Example Response:**
```json
{
  "userId": "user_2abc123def456",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2025-03-03T21:56:23.000Z"
}
```

#### Document Generation

**Generate SOP:**
```typescript
// convex/documents/generate.ts
export const generateSOP = mutation({
  args: {
    userId: v.string(),
    universityId: v.optional(v.string()),
    programId: v.optional(v.string()),
    background: v.object({
      education: v.array(v.object({
        degree: v.string(),
        institution: v.string(),
        field: v.string(),
        graduationYear: v.number()
      })),
      workExperience: v.array(v.object({
        title: v.string(),
        company: v.string(),
        startDate: v.string(),
        endDate: v.optional(v.string()),
        description: v.string()
      })),
      achievements: v.array(v.string()),
      researchExperience: v.optional(v.array(v.object({
        title: v.string(),
        institution: v.string(),
        description: v.string(),
        publications: v.optional(v.array(v.string()))
      }))),
      careerGoals: v.string()
    })
  },
  handler: async (ctx, args) => {
    // Implementation details for AI generation
    // Returns generated content
  }
});
```

**Example Request:**
```typescript
import { api } from "../convex/_generated/api";
import { useMutation } from "convex/react";

const generateSOP = useMutation(api.documents.generate.generateSOP);
generateSOP({
  userId: "usr_1a2b3c4d5e",
  universityId: "univ_5e4d3c2b1a",
  programId: "prog_9z8y7x6w5v",
  background: {
    education: [{
      degree: "Bachelor of Science",
      institution: "Universidad Nacional Autónoma de México",
      field: "Computer Science",
      graduationYear: 2022
    }],
    workExperience: [{
      title: "Software Engineer",
      company: "TechMex Solutions",
      startDate: "2022-06-01",
      endDate: "2025-03-01",
      description: "Developed backend systems using Node.js and PostgreSQL"
    }],
    achievements: [
      "Won 2nd place in National Coding Competition 2021",
      "Published paper on distributed systems optimization"
    ],
    researchExperience: [{
      title: "Research Assistant",
      institution: "UNAM Computer Science Department",
      description: "Assisted in research on machine learning algorithms for natural language processing",
      publications: ["Efficient NLP Approaches for Spanish Language Processing"]
    }],
    careerGoals: "Pursue research in AI with focus on multilingual NLP applications"
  }
});
```

**Example Response:**
```json
{
  "documentId": "doc_9v8u7t6s5r",
  "content": "# Statement of Purpose\n\nAs a Computer Science graduate from Universidad Nacional Autónoma de México with professional experience in software engineering at TechMex Solutions, I am applying to your esteemed Master's program in Artificial Intelligence. My background in backend development has cultivated a strong foundation in system architecture and data management, while my research experience at UNAM's Computer Science Department has ignited my passion for natural language processing.\n\nDuring my time as a Research Assistant, I contributed to groundbreaking work on machine learning algorithms for Spanish language processing, resulting in a publication that explored efficient approaches for NLP in non-English contexts. This experience, combined with my second-place achievement in the National Coding Competition 2021, has prepared me to contribute meaningfully to your program's research initiatives.\n\nMy career goal is to advance the field of multilingual NLP applications, developing AI systems that better serve speakers of diverse languages. Your program's focus on inclusive AI technologies and the groundbreaking research conducted by Dr. Rodriguez on cross-lingual transfer learning makes your university the ideal environment for me to pursue this vision.\n\nWith my technical expertise, research background, and dedication to expanding AI's linguistic capabilities, I am confident that I will thrive in your program and contribute to the department's innovative work.",
  "createdAt": "2025-03-03T22:17:25.000Z"
}
```

#### University Search API

**Search Universities:**
```typescript
// convex/universities/search.ts
export const searchUniversities = query({
  args: {
    query: v.optional(v.string()),
    filters: v.optional(v.object({
      programType: v.optional(v.string()),
      location: v.optional(v.string()),
      ranking: v.optional(v.string())
    })),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Implementation details
  }
});
```

**Example Request:**
```typescript
import { api } from "../convex/_generated/api";
import { useQuery } from "convex/react";

const universities = useQuery(api.universities.search.searchUniversities, {
  query: "computer science",
  filters: {
    programType: "MS",
    location: "California",
    ranking: "top-50"
  },
  limit: 10
});
```

**Example Response:**
```json
{
  "results": [
    {
      "id": "univ_1a2b3c4d5e",
      "name": "Stanford University",
      "location": {
        "city": "Stanford",
        "state": "California",
        "country": "United States"
      },
      "programs": [
        {
          "id": "prog_5e4d3c2b1a",
          "name": "Computer Science",
          "degree": "MS",
          "department": "School of Engineering",
          "requirements": {
            "gre": true,
            "toefl": true,
            "minimumGPA": 3.5,
            "applicationFee": 125
          },
          "deadlines": {
            "fall": "2025-12-01T00:00:00.000Z",
            "spring": null,
            "summer": null
          },
          "acceptanceRate": 0.05
        }
      ],
      "ranking": 2,
      "website": "https://www.stanford.edu"
    },
    // More universities...
  ],
  "totalCount": 24
}
```

#### Application Tracking API

**Create Application:**
```typescript
// convex/applications/create.ts
export const createApplication = mutation({
  args: {
    userId: v.string(),
    universityId: v.string(),
    programId: v.string(),
    deadline: v.string(),
    documents: v.array(v.object({
      type: v.string(),
      status: v.string()
    }))
  },
  handler: async (ctx, args) => {
    // Implementation details
  }
});
```

**Example Request:**
```typescript
import { api } from "../convex/_generated/api";
import { useMutation } from "convex/react";

const createApplication = useMutation(api.applications.create.createApplication);
createApplication({
  userId: "usr_1a2b3c4d5e",
  universityId: "univ_5e4d3c2b1a",
  programId: "prog_9z8y7x6w5v",
  deadline: "2025-12-01",
  documents: [
    { type: "SOP", status: "NOT_STARTED" },
    { type: "LOR", status: "NOT_STARTED" },
    { type: "Transcripts", status: "NOT_STARTED" },
    { type: "Resume", status: "IN_PROGRESS" }
  ]
});
```

**Example Response:**
```json
{
  "applicationId": "app_1q2w3e4r5t",
  "universityName": "Stanford University",
  "programName": "Computer Science",
  "status": "NOT_STARTED",
  "deadline": "2025-12-01T00:00:00.000Z",
  "createdAt": "2025-03-03T22:18:30.000Z"
}
```

## Data Models

### User Model
```typescript
// src/types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  profile?: {
    education: Education[];
    workExperience: WorkExperience[];
    achievements: string[];
    researchExperience?: ResearchExperience[];
    skills: string[];
    careerGoals: string;
  }
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  field: string;
  gpa?: number;
  startDate: Date;
  graduationDate: Date;
  description?: string;
  courses?: string[];
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  achievements?: string[];
}

export interface ResearchExperience {
  id: string;
  title: string;
  institution: string;
  supervisor?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  publications?: Publication[];
}

export interface Publication {
  title: string;
  authors: string[];
  journal?: string;
  conference?: string;
  year: number;
  doi?: string;
  url?: string;
}
```

### Document Model
```typescript
// src/types/document.ts
export interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  documentType: DocumentType;
  targetUniversity?: string;
  targetProgram?: string;
  createdAt: Date;
  updatedAt: Date;
  versions: DocumentVersion[];
  status: DocumentStatus;
  tags: string[];
  aiGenerated: boolean;
  lastEdited: Date;
}

export enum DocumentType {
  SOP = "SOP",
  LOR = "LOR",
  CV = "CV",
  RESUME = "RESUME",
  RESEARCH_STATEMENT = "RESEARCH_STATEMENT",
  PERSONAL_STATEMENT = "PERSONAL_STATEMENT",
  OTHER = "OTHER"
}

export enum DocumentStatus {
  DRAFT = "DRAFT",
  REVIEWING = "REVIEWING",
  FINAL = "FINAL"
}

export interface DocumentVersion {
  id: string;
  content: string;
  timestamp: Date;
  comment?: string;
}
```

### University Model
```typescript
// src/types/university.ts
export interface University {
  id: string;
  name: string;
  location: Location;
  programs: Program[];
  ranking?: number;
  website: string;
  description?: string;
  admissionStats?: AdmissionStats;
  imageUrl?: string;
  isFavorite?: boolean; // Client-side only
}

export interface Location {
  city: string;
  state: string;
  country: string;
  region?: string;
}

export interface Program {
  id: string;
  name: string;
  degree: DegreeType;
  department: string;
  requirements: ProgramRequirements;
  deadlines: ProgramDeadlines;
  acceptanceRate?: number;
  tuition?: number;
  duration?: string;
  website?: string;
  facultyStrengths?: string[];
  researchAreas?: string[];
}

export enum DegreeType {
  MS = "MS",
  MA = "MA",
  PHD = "PhD",
  MBA = "MBA",
  MFA = "MFA",
  MEM = "MEM",
  OTHER = "OTHER"
}

export interface ProgramRequirements {
  gre: boolean;
  greRequired?: boolean;
  grePreferred?: boolean;
  greWaiver?: boolean;
  toefl: boolean;
  toeflMinimum?: number;
  ielts?: boolean;
  ieltsMinimum?: number;
  minimumGPA: number;
  applicationFee: number;
  recommendationLetters: number;
  statementRequired: boolean;
  cvRequired: boolean;
  writingSampleRequired?: boolean;
  portfolioRequired?: boolean;
  interviewRequired?: boolean;
}

export interface ProgramDeadlines {
  fall: Date | null;
  spring: Date | null;
  summer: Date | null;
  priority?: Date | null;
  funding?: Date | null;
}

export interface AdmissionStats {
  applicants?: number;
  admitted?: number;
  enrolled?: number;
  acceptanceRate?: number;
  averageGPA?: number;
  averageGRE?: {
    verbal?: number;
    quantitative?: number;
    analytical?: number;
  };
}
```

### Application Model
```typescript
// src/types/application.ts
export interface Application {
  id: string;
  userId: string;
  universityId: string;
  universityName: string;
  programId: string;
  programName: string;
  status: ApplicationStatus;
  deadline: Date;
  documents: ApplicationDocument[];
  notes: ApplicationNote[];
  contacts: ApplicationContact[];
  timeline: ApplicationEvent[];
  createdAt: Date;
  updatedAt: Date;
  submissionDate?: Date;
  decision?: ApplicationDecision;
  decisionDate?: Date;
}

export enum ApplicationStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  SUBMITTED = "SUBMITTED",
  INTERVIEW = "INTERVIEW",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WAITLISTED = "WAITLISTED",
  DEFERRED = "DEFERRED",
  WITHDRAWN = "WITHDRAWN"
}

export enum ApplicationDecision {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WAITLISTED = "WAITLISTED",
  DEFERRED = "DEFERRED"
}

export interface ApplicationDocument {
  type: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  documentId?: string;
  notes?: string;
  dueDate?: Date;
}

export interface ApplicationNote {
  id: string;
  content: string;
  timestamp: Date;
  category?: string;
}

export interface ApplicationContact {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  notes?: string;
  lastContacted?: Date;
}

export interface ApplicationEvent {
  id: string;
  event: string;
  date: Date;
  description?: string;
  completed: boolean;
}
```

## UI/UX Guidelines

### Design Principles

1. **Clarity & Simplicity**
   - Clean layouts with clear visual hierarchy
   - Minimal cognitive load for users
   - Progressive disclosure for complex features

2. **Accessibility**
   - WCAG 2.1 AA compliance required
   - Keyboard navigation support
   - Screen reader compatibility
   - Color contrast ratios of at least 4.5:1

3. **Responsiveness**
   - Mobile-first approach
   - Fluid layouts that adapt to all screen sizes
   - Touch-friendly UI elements

4. **Consistency**
   - Unified design language across all pages
   - Predictable interaction patterns
   - Consistent terminology and labeling

5. **User Feedback**
   - Clear loading states
   - Meaningful error messages
   - Success confirmations
   - Empty state designs

### Color Palette

```css
/* Primary colors */
--primary: #4361ee;
--primary-light: #6089ff;
--primary-dark: #2541b2;

/* Secondary colors */
--secondary: #3a0ca3;
--secondary-light: #5c31d6;
--secondary-dark: #2a0875;

/* Neutral colors */
--text-primary: #1a1a2e;
--text-secondary: #4a4a6a;
--background: #ffffff;
--surface: #f7f7f9;
--border: #e1e1e8;

/* Feedback colors */
--success: #06d6a0;
--warning: #ffd166;
--error: #ef476f;
--info: #118ab2;
```

### Typography

```css
/* Font families */
--font-primary: 'Inter', sans-serif;
--font-secondary: 'Poppins', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Component Examples

#### Button Variants

```tsx
// src/components/common/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-dark",
        secondary: "bg-secondary text-white hover:bg-secondary-dark",
        outline: "border border-primary text-primary hover:bg-primary/10",
        ghost: "text-primary hover:bg-primary/10",
        destructive: "bg-error text-white hover:bg-error/90",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = ({ 
  className, 
  variant, 
  size, 
  isLoading, 
  children, 
  ...props 
}: ButtonProps) => {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
```

#### Form Field Examples

```tsx
// src/components/common/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
}

const Input = ({ label, description, error, className, ...props }: InputProps) => {
  const id = props.id || label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="space-y-2">
      <label 
        htmlFor={id}
        className="text-sm font-medium text-text-primary"
      >
        {label}
      </label>
      
      {description && (
        <p className="text-xs text-text-secondary">
          {description}
        </p>
      )}
      
      <input
        id={id}
        className={`
          w-full px-3 py-2 rounded-md border
          ${error ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'}
          focus:outline-none focus:ring-2 focus:ring-offset-1
          placeholder:text-text-secondary/60
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
```

## Development Standards

### Coding Conventions

1. **TypeScript Best Practices**
   - Use strict type checking (`"strict": true` in tsconfig.json)
   - Avoid `any` types; prefer explicit types or `unknown`
   - Use interface for object types and type for unions/primitives/etc.
   - Leverage type guards for runtime type checking

2. **React Standards**
   - Functional components with hooks
   - Custom hooks for reusable logic
   - Memoization for performance optimization (`useMemo`, `useCallback`, `memo`)
   - Proper key usage in lists
   - Component composition over prop drilling

3. **File Organization**
   - One component per file
   - Component-related types in same file or dedicated types file
   - Group related components in folders
   - Barrel exports for clean imports

4. **Naming Conventions**
   - PascalCase for React components and types
   - camelCase for variables, functions, and instances
   - ALL_CAPS for constants
   - Descriptive, intention-revealing names

### Code Quality Tools

1. **ESLint Configuration**
   ```js
   // eslint.config.js (flat config)
   import eslint from '@eslint/js';
   import tseslint from 'typescript-eslint';
   import reactPlugin from 'eslint-plugin-react';
   import hooksPlugin from 'eslint-plugin-react-hooks';
   import a11yPlugin from 'eslint-plugin-jsx-a11y';

   export default [
     eslint.configs.recommended,
     ...tseslint.configs.recommended,
     {
       plugins: {
         react: reactPlugin,
         'react-hooks': hooksPlugin,
         'jsx-a11y': a11yPlugin
       },
       rules: {
         'react/react-in-jsx-scope': 'off',
         'react-hooks/rules-of-hooks': 'error',
         'react-hooks/exhaustive-deps': 'warn',
         'jsx-a11y/alt-text': 'error',
         // Additional custom rules...
       }
     },
     {
       files: ['**/*.{ts,tsx}'],
       rules: {
         // TypeScript specific rules
         '@typescript-eslint/explicit-function-return-type': 'off',
         '@typescript-eslint/no-unused-vars': ['warn', {
           argsIgnorePattern: '^_',
           varsIgnorePattern: '^_',
         }],
         // More rules...
       }
     }
   ];
   ```

2. **Commit Message Format**
   ```
   <type>(<scope>): <summary>

   <description>

   <footer>
   ```

   Types: feat, fix, docs, style, refactor, test, chore
   Example: `feat(auth): implement email verification flow`

### Error Handling

1. **Frontend Error Handling**
   - Use error boundaries for React component errors
   - Implement global error handler for unhandled exceptions
   - Provide user-friendly error messages
   - Log detailed errors for debugging

2. **API Error Handling**
   ```typescript
   // src/utils/api.ts
   import { ConvexError } from "convex/values";
   import { ClerkAPIError } from '@clerk/types';

   export enum ErrorType {
     VALIDATION = "VALIDATION",
     AUTHENTICATION = "AUTHENTICATION",
     AUTHORIZATION = "AUTHORIZATION",
     NOT_FOUND = "NOT_FOUND",
     RATE_LIMIT = "RATE_LIMIT",
     SERVER = "SERVER"
   }

   export interface AppError {
     type: ErrorType;
     message: string;
     field?: string;
     details?: any;
   }

   export function handleApiError(error: unknown): AppError {
     if (error instanceof ConvexError) {
       // Handle Convex-specific errors
       return {
         type: ErrorType.SERVER,
         message: error.message
       };
     }
     
     if (error instanceof ClerkAPIError) {
       // Handle Clerk authentication errors
       return {
         type: ErrorType.AUTHENTICATION,
         message: error.errors[0]?.message || "Authentication error",
         details: error.errors
       };
     }
     
     if (error instanceof Error) {
       return {
         type: ErrorType.SERVER,
         message: error.message
       };
     }
     
     return {
       type: ErrorType.SERVER,
       message: "An unknown error occurred"
     };
   }
   ```

## Testing Requirements

### Unit Testing

- Minimum 80% test coverage for utility functions and hooks
- Jest as the test runner
- React Testing Library for component testing

**Example Test:**
```typescript
// src/utils/__tests__/formatting.test.ts
import { formatDate, truncateText } from '../formatting';

describe('formatDate', () => {
  it('should format date in default format', () => {
    const date = new Date('2025-03-03');
    expect(formatDate(date)).toBe('Mar 3, 2025');
  });
  
  it('should format date with custom format', () => {
    const date = new Date('2025-03-03');
    expect(formatDate(date, 'yyyy-MM-dd')).toBe('2025-03-03');
  });
});

describe('truncateText', () => {
  it('should truncate text longer than specified length', () => {
    expect(truncateText('This is a long text', 10)).toBe('This is a...');
  });
  
  it('should not truncate text shorter than specified length', () => {
    expect(truncateText('Short', 10)).toBe('Short');
  });
});
```

### Integration Testing

- Test key user flows
- Cypress for end-to-end testing
- Focus on critical paths: authentication, document creation, application tracking

**Example Test:**
```typescript
// cypress/e2e/document-creation.cy.ts
describe('Document Creation Flow', () => {
  beforeEach(() => {
    cy.signInWithClerk('test@example.com', 'password123');
    cy.visit('/documents/new');
  });
  
  it('should create a new Statement of Purpose', () => {
    // Select document type
    cy.findByLabelText('Document Type').select('Statement of Purpose');
    
    // Enter document title
    cy.findByLabelText('Title').type('Stanford CS MS SOP');
    
    // Select university
    cy.findByLabelText('University').type('Stanford');
    cy.findByText('Stanford University').click();
    
    // Use AI generation
    cy.findByText('Generate Draft').click();
    
    // Wait for generation to complete
    cy.findByText('Draft Generated!', { timeout: 10000 }).should('be.visible');
    
    // Verify content exists
    cy.get('.rich-text-editor').should('not.be.empty');
    
    // Save document
    cy.findByText('Save Document').click();
    
    // Verify success message
    cy.findByText('Document saved successfully').should('be.visible');
    
    // Verify document appears in documents list
    cy.visit('/documents');
    cy.findByText('Stanford CS MS SOP').should('be.visible');
  });
});
```

### User Acceptance Testing

- Test with representative users from each persona group
- Collect specific metrics:
  - Task completion rate
  - Time on task
  - Error rate
  - Satisfaction score
- Focus on top user scenarios from PRD

## Release Criteria

### MVP Requirements

The Minimum Viable Product must include:

1. **User Authentication**
   - Registration and login functionality using Clerk
   - Password reset capability
   - Profile creation
   
2. **Document Management**
   - Create, edit, and delete documents
   - Basic document generation with AI
   - Document preview and export (PDF)

3. **University Information**
   - Basic university and program search
   - View program requirements and deadlines

4. **Application Tracking**
   - Create and manage application entries
   - Track application status
   - Set and view application deadlines

### Quality Standards

1. **Performance**
   - Page load time < 2 seconds on desktop, < 3 seconds on mobile
   - Document generation response time < 5 seconds
   - Search results in < 1 second

2. **Reliability**
   - 99.5% uptime during beta
   - No data loss during normal operations
   - Automatic error recovery for common failures

3. **Security**
   - All user data encrypted at rest and in transit
   - No critical or high security vulnerabilities
   - Secure authentication and authorization

### Success Metrics

1. **User Engagement**
   - 70% of registered users create at least one document
   - Average session duration > 10 minutes
   - Return visit rate > 40% within first month

2. **Document Generation**
   - 90% of users generate at least one document
   - 60% of users edit and save generated documents
   - < 5% document generation failures

3. **User Satisfaction**
   - Net Promoter Score (NPS) > 30
   - Customer Satisfaction Score (CSAT) > 4/5
   - Feature satisfaction rating > 3.5/5 for core features

---

This PRD provides comprehensive guidance for developers implementing the GradAid application. It defines clear requirements, technical specifications, and quality standards while maintaining flexibility for implementation details. The development team should use this document as the authoritative reference for building the product while consulting with the product owner regarding any ambiguities or necessary adjustments during development.