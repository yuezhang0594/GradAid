import { internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Define types based on our schema
type University = Doc<"universities">
type UniversityInput = Omit<University, "_id" | "_creationTime">

type Program = Doc<"programs">
type ProgramInput = Omit<Program, "_id" | "_creationTime">

type Application = Doc<"applications">
type ApplicationInput = Omit<Application, "_id" | "_creationTime">

type ApplicationDocument = Doc<"applicationDocuments">
type ApplicationDocumentInput = Omit<ApplicationDocument, "_id" | "_creationTime">

type LOR = Doc<"letterOfRecommendations">
type LORInput = Omit<LOR, "_id" | "_creationTime">

type UserActivity = Doc<"userActivity">
type UserActivityInput = Omit<UserActivity, "_id" | "_creationTime">

type AICredits = Doc<"aiCredits">
type AICreditsInput = Omit<AICredits, "_id" | "_creationTime">

type UserProfile = Doc<"userProfiles">
type UserProfileInput = Omit<UserProfile, "_id" | "_creationTime">

// Map of university names to common abbreviations
const universityAbbreviations: Record<string, string> = {
  "Massachusetts Institute of Technology": "mit",
  "University of California, Berkeley": "berkeley",
  "Carnegie Mellon University": "cmu",
  "Georgia Institute of Technology": "gatech",
  "University of Washington": "washington",
  "Stanford University": "stanford",
  "University of Illinois at Urbana-Champaign": "illinois",
  "California Institute of Technology": "caltech",
  "University of Michigan": "umich",
  "Cornell University": "cornell",
  "Princeton University": "princeton",
  "Harvard University": "harvard",
  "Boston University": "bu",
  "Northeastern University": "northeastern",
  "Tufts University": "tufts",
  "Boston College": "bc",
  "Brandeis University": "brandeis"
};

// Default export that safely seeds the database
export default internalMutation({
  handler: async (ctx) => {
    console.log("Deleting existing data from the database...");

    // Clear all existing data
    const tablesToClear = [
      "users",
      "universities",
      "programs",
      "applications",
      "applicationDocuments",
      "letterOfRecommendations",
      "aiCredits",
      "userActivity",
      "userProfiles"
    ] as const;

    for (const table of tablesToClear) {
      await ctx.db
        .query(table)
        .collect()
        .then(existingData => {
          return Promise.all(
            existingData.map(item =>
              ctx.db.delete(item._id)
            )
          );
        });
    }

    console.log("Initializing database with seed data...");

    // Create mock user first - following Clerk schema
    const mockUserId = await ctx.db.insert("users", {
      name: "Demo User",
      email: "demo@example.com",
      clerkId: "user_demo",
    });

    // Initialize user profile
    await ctx.db.insert("userProfiles", {
      userId: mockUserId,
      countryOfOrigin: "United States",
      dateOfBirth: "1995-01-01",
      currentLocation: "Boston, MA",
      nativeLanguage: "English",
      educationLevel: "Bachelor's",
      major: "Computer Science",
      university: "Boston University",
      gpa: 3.8,
      gpaScale: 4.0,
      graduationDate: "2024-05",
      researchExperience: "2 years of research in machine learning and natural language processing",
      greScores: {
        verbal: 165,
        quantitative: 168,
        analyticalWriting: 5.0,
        testDate: "2024-01-15"
      },
      targetDegree: "MS",
      intendedField: "Computer Science",
      researchInterests: ["Artificial Intelligence", "Machine Learning", "Natural Language Processing"],
      careerObjectives: "Pursue research in AI/ML with focus on practical applications",
      targetLocations: ["California", "Massachusetts", "New York"],
      expectedStartDate: "2025-09",
      budgetRange: "$30,000-$50,000",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      onboardingCompleted: true
    });

    // University data
    const universityData: UniversityInput[] = [
      {
        name: "Stanford University",
        location: {
          city: "Stanford",
          state: "California",
          country: "USA",
        },
        ranking: 4,
        website: "https://www.stanford.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/stanford.jpg",
      },
      {
        name: "Massachusetts Institute of Technology",
        location: {
          city: "Cambridge",
          state: "Massachusetts",
          country: "USA",
        },
        ranking: 2,
        website: "https://www.mit.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/mit.jpg",
      },
      {
        name: "University of California Berkeley",
        location: {
          city: "Berkeley",
          state: "California",
          country: "USA",
        },
        ranking: 17,
        website: "https://www.berkeley.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/berkeley.jpg",
      },
      {
        name: "Carnegie Mellon University",
        location: {
          city: "Pittsburgh",
          state: "Pennsylvania",
          country: "USA",
        },
        ranking: 21,
        website: "https://www.cmu.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/cmu.jpg",
      },
      {
        name: "Georgia Institute of Technology",
        location: {
          city: "Atlanta",
          state: "Georgia",
          country: "USA",
        },
        ranking: 33,
        website: "https://www.gatech.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/gatech.jpg",
      }
    ];

    // Insert universities and store their IDs
    const universityIds: Record<string, Id<"universities">> = {};

    for (const university of universityData) {
      const id = await ctx.db.insert("universities", university);
      universityIds[university.name] = id;
    }

    // Program data that references university IDs
    const programData: ProgramInput[] = [
      {
        universityId: universityIds["Stanford University"],
        name: "Computer Science",
        degree: "MS",
        department: "School of Engineering",
        requirements: {
          minimumGPA: 3.5,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 1",
          spring: undefined,
        },
        website: "https://cs.stanford.edu/academics/masters",
      },
      {
        universityId: universityIds["Stanford University"],
        name: "Computer Science",
        degree: "PhD",
        department: "School of Engineering",
        requirements: {
          minimumGPA: 3.7,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 1",
          spring: undefined,
        },
        website: "https://cs.stanford.edu/academics/phd",
      },
      {
        universityId: universityIds["Massachusetts Institute of Technology"],
        name: "Electrical Engineering and Computer Science",
        degree: "PhD",
        department: "School of Engineering",
        requirements: {
          minimumGPA: 3.7,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 15",
          spring: undefined,
        },
        website: "https://www.eecs.mit.edu/graduate/",
      },
      {
        universityId: universityIds["University of California Berkeley"],
        name: "Computer Science",
        degree: "MS",
        department: "College of Engineering",
        requirements: {
          minimumGPA: 3.0,
          gre: false,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 15",
          spring: undefined,
        },
        website: "https://eecs.berkeley.edu/academics/graduate",
      },
      {
        universityId: universityIds["Carnegie Mellon University"],
        name: "Computer Science",
        degree: "MS",
        department: "School of Computer Science",
        requirements: {
          minimumGPA: 3.6,
          gre: true,
          toefl: false,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 10",
          spring: undefined,
        },
        website: "https://www.cs.cmu.edu/academics/masters",
      },
      {
        universityId: universityIds["Georgia Institute of Technology"],
        name: "Computer Science",
        degree: "MS",
        department: "College of Computing",
        requirements: {
          minimumGPA: 3.0,
          gre: false,
          toefl: true,
          recommendationLetters: 2,
        },
        deadlines: {
          fall: "February 1",
          spring: "August 1",
        },
        website: "https://www.cc.gatech.edu/ms-cs",
      },
      {
        universityId: universityIds["Georgia Institute of Technology"],
        name: "Cybersecurity",
        degree: "MS",
        department: "College of Computing",
        requirements: {
          minimumGPA: 3.0,
          gre: false,
          toefl: true,
          recommendationLetters: 2,
        },
        deadlines: {
          fall: "February 1",
          spring: "August 1",
        },
        website: "https://www.cc.gatech.edu/ms-cybersecurity",
      }
    ];

    // Insert programs
    for (const program of programData) {
      await ctx.db.insert("programs", program);
    }

    // Initialize AI credits
    await ctx.db.insert("aiCredits", {
      userId: mockUserId,
      totalCredits: 500,
      usedCredits: 250,
      resetDate: "2025-04-01",
      lastUpdated: new Date().toISOString(),
    });

    // Create applications data (matches /applications route)
    const applicationData: ApplicationInput[] = [
      {
        userId: mockUserId,
        universityId: universityIds["Stanford University"],
        program: "MS Computer Science",
        status: "submitted",
        submissionDate: "2025-03-01",
        deadline: "2025-05-15",
        priority: "high",
        notes: "Top choice program, strong research alignment with AI lab",
        lastUpdated: new Date().toISOString(),
      },
      {
        userId: mockUserId,
        universityId: universityIds["Massachusetts Institute of Technology"],
        program: "MS Artificial Intelligence",
        status: "submitted",
        submissionDate: "2025-02-15",
        deadline: "2025-05-30",
        priority: "high",
        notes: "Excellent fit for AI research interests",
        lastUpdated: new Date().toISOString(),
      },
      {
        userId: mockUserId,
        universityId: universityIds["University of California Berkeley"],
        program: "MS Computer Science",
        status: "in_progress",
        deadline: "2025-06-15",
        priority: "high",
        notes: "Strong systems research group",
        lastUpdated: new Date().toISOString(),
      },
      {
        userId: mockUserId,
        universityId: universityIds["Carnegie Mellon University"],
        program: "MS Computer Science",
        status: "in_progress",
        deadline: "2025-07-01",
        priority: "medium",
        notes: "Interested in ML/Robotics lab",
        lastUpdated: new Date().toISOString(),
      },
      {
        userId: mockUserId,
        universityId: universityIds["Georgia Institute of Technology"],
        program: "MS Computer Science",
        status: "in_progress",
        deadline: "2025-08-15",
        priority: "medium",
        notes: "Good funding opportunities",
        lastUpdated: new Date().toISOString(),
      },
    ];

    const applicationIds: Record<string, Id<"applications">> = {};
    for (const application of applicationData) {
      const id = await ctx.db.insert("applications", application);
      applicationIds[`${application.universityId}-${application.program}`] = id;
    }

    // Create application documents data
    const documentData: ApplicationDocumentInput[] = [
      {
        userId: mockUserId,
        applicationId: applicationIds[`${universityIds["Stanford University"]}-MS Computer Science`],
        title: "Statement of Purpose",
        type: "sop",
        status: "in_review",
        progress: 75,
        lastEdited: new Date().toISOString(),
        content: "Draft statement of purpose focusing on research interests in AI and systems...",
        aiSuggestionsCount: 5,
      },
      {
        userId: mockUserId,
        applicationId: applicationIds[`${universityIds["Stanford University"]}-MS Computer Science`],
        title: "Research Statement",
        type: "research_statement",
        status: "in_review",
        progress: 45,
        lastEdited: new Date().toISOString(),
        content: "Outline of research experience and future research goals...",
        aiSuggestionsCount: 3,
      },
      {
        userId: mockUserId,
        applicationId: applicationIds[`${universityIds["Stanford University"]}-MS Computer Science`],
        title: "CV",
        type: "cv",
        status: "complete",
        progress: 100,
        lastEdited: new Date().toISOString(),
        content: "Professional CV with academic and research experience...",
        aiSuggestionsCount: 2,
      },
    ];

    for (const document of documentData) {
      await ctx.db.insert("applicationDocuments", document);
    }

    // Create LOR data (matches Stanford requirements)
    const lorData: LORInput[] = [
      {
        userId: mockUserId,
        applicationId: applicationIds[`${universityIds["Stanford University"]}-MS Computer Science`],
        recommenderName: "Prof. Johnson",
        recommenderEmail: "johnson@university.edu",
        status: "submitted",
        requestedDate: "2025-01-15",
        submittedDate: "2025-02-28",
        remindersSent: 1,
        lastReminderDate: "2025-02-15",
      },
      {
        userId: mockUserId,
        applicationId: applicationIds[`${universityIds["Stanford University"]}-MS Computer Science`],
        recommenderName: "Dr. Smith",
        recommenderEmail: "smith@research.org",
        status: "submitted",
        requestedDate: "2025-01-15",
        submittedDate: "2025-02-20",
        remindersSent: 0,
      },
      {
        userId: mockUserId,
        applicationId: applicationIds[`${universityIds["Stanford University"]}-MS Computer Science`],
        recommenderName: "Dr. Wilson",
        recommenderEmail: "wilson@institute.edu",
        status: "submitted",
        requestedDate: "2025-01-15",
        submittedDate: "2025-02-25",
        remindersSent: 1,
        lastReminderDate: "2025-02-10",
      },
    ];

    for (const lor of lorData) {
      await ctx.db.insert("letterOfRecommendations", lor);
    }

    // Create activity log
    const activityData: UserActivityInput[] = [
      {
        userId: mockUserId,
        type: "application_update",
        description: "Submitted application to Stanford University",
        timestamp: "2025-03-01T12:00:00Z",
        metadata: {
          applicationId: applicationIds[`${universityIds["Stanford University"]}-MS Computer Science`],
          oldStatus: "in_progress",
          newStatus: "submitted"
        },
      },
      {
        userId: mockUserId,
        type: "document_edit",
        description: "Updated Statement of Purpose",
        timestamp: "2025-02-28T15:30:00Z",
        metadata: {
          documentId: (await ctx.db.query("applicationDocuments")
            .filter(q => q.eq(q.field("title"), "Statement of Purpose"))
            .first())?._id,
          oldProgress: 70,
          newProgress: 75
        },
      },
      {
        userId: mockUserId,
        type: "lor_update",
        description: "Received LOR from Prof. Johnson",
        timestamp: "2025-02-28T09:15:00Z",
        metadata: {
          lorId: (await ctx.db.query("letterOfRecommendations")
            .filter(q => q.eq(q.field("recommenderName"), "Prof. Johnson"))
            .first())?._id,
          oldStatus: "in_progress",
          newStatus: "submitted"
        },
      },
    ];

    for (const activity of activityData) {
      await ctx.db.insert("userActivity", activity);
    }

    console.log("Database initialization complete!");

    return { success: true };
  },
});
