import { internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { WithoutSystemFields } from "convex/server";
import { v } from "convex/values";
import { ApplicationPriority } from "./validators";

// Define types based on our schema
type University = Doc<"universities">
type UniversityInput = WithoutSystemFields<University>

type Program = Doc<"programs">
type ProgramInput = WithoutSystemFields<Program>

type Application = Doc<"applications">
type ApplicationInput = WithoutSystemFields<Application>

type ApplicationDocument = Doc<"applicationDocuments">
type ApplicationDocumentInput = WithoutSystemFields<ApplicationDocument>

type UserActivity = Doc<"userActivity">
type UserActivityInput = WithoutSystemFields<UserActivity>

type AICredits = Doc<"aiCredits">
type AICreditsInput = WithoutSystemFields<AICredits>

type UserProfile = Doc<"userProfiles">
type UserProfileInput = WithoutSystemFields<UserProfile>

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
  args: {
    keepProfileData: v.optional(v.boolean())
  },
  /**
   * Initializes the database with mock data for testing purposes.
   * 
   * This function deletes existing data in specified tables and inserts
   * predefined mock data, including user profiles, universities, programs,
   * applications, application documents, letters of recommendation, AI credits,
   * and user activity logs. It handles the removal of an old demo user and its
   * associated data if present.
   * 
   * @param ctx - The context containing the database instance.
   * @param args - The arguments to the handler function.
   * @param args.keepProfileData - A boolean that indicates whether to retain
   * user profile data during the data deletion process.
   * 
   * @returns An object containing the success status, list of cleared tables,
   * and list of kept tables.
   */
  handler: async (ctx, args) => {
    console.log("Deleting existing data from the database...");
    const keepProfileData = args.keepProfileData ?? true;

    // Tables that contain profile data
    const profileTables = [
      "userProfiles",
      "aiCredits",
      "userActivity",
    ] as const;

    // Clear all existing data (except user data)
    const tablesToClear = [
      "universities",
      "programs",
      "favorites",
      "applications",
      "applicationDocuments",
      ...(keepProfileData ? [] : profileTables)
    ] as const;

    const clearedTables: string[] = [];

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
      clearedTables.push(table);
    }
    console.log("Data deleted successfully");
    console.log("Initializing database with seed data...");

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
      },
      {
        name: "Harvard University",
        location: {
          city: "Cambridge",
          state: "Massachusetts",
          country: "USA",
        },
        ranking: 1,
        website: "https://www.harvard.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/harvard.jpg",
      },
      {
        name: "Princeton University",
        location: {
          city: "Princeton",
          state: "New Jersey",
          country: "USA",
        },
        ranking: 3,
        website: "https://www.princeton.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/princeton.jpg",
      },
      {
        name: "California Institute of Technology",
        location: {
          city: "Pasadena",
          state: "California",
          country: "USA",
        },
        ranking: 5,
        website: "https://www.caltech.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/caltech.jpg",
      },
      {
        name: "University of Chicago",
        location: {
          city: "Chicago",
          state: "Illinois",
          country: "USA",
        },
        ranking: 6,
        website: "https://www.uchicago.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/uchicago.jpg",
      },
      {
        name: "University of Pennsylvania",
        location: {
          city: "Philadelphia",
          state: "Pennsylvania",
          country: "USA",
        },
        ranking: 8,
        website: "https://www.upenn.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/upenn.jpg",
      },
      {
        name: "Yale University",
        location: {
          city: "New Haven",
          state: "Connecticut",
          country: "USA",
        },
        ranking: 9,
        website: "https://www.yale.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/yale.jpg",
      },
      {
        name: "Columbia University",
        location: {
          city: "New York",
          state: "New York",
          country: "USA",
        },
        ranking: 11,
        website: "https://www.columbia.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/columbia.jpg",
      },
      {
        name: "Cornell University",
        location: {
          city: "Ithaca",
          state: "New York",
          country: "USA",
        },
        ranking: 12,
        website: "https://www.cornell.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/cornell.jpg",
      },
      {
        name: "University of Michigan",
        location: {
          city: "Ann Arbor",
          state: "Michigan",
          country: "USA",
        },
        ranking: 23,
        website: "https://www.umich.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/umich.jpg",
      },
      {
        name: "Northwestern University",
        location: {
          city: "Evanston",
          state: "Illinois",
          country: "USA",
        },
        ranking: 25,
        website: "https://www.northwestern.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/northwestern.jpg",
      },
      {
        name: "University of California, Los Angeles",
        location: {
          city: "Los Angeles",
          state: "California",
          country: "USA",
        },
        ranking: 27,
        website: "https://www.ucla.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/ucla.jpg",
      },
      {
        name: "University of Washington",
        location: {
          city: "Seattle",
          state: "Washington",
          country: "USA",
        },
        ranking: 29,
        website: "https://www.washington.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/washington.jpg",
      },
      {
        name: "University of Illinois at Urbana-Champaign",
        location: {
          city: "Urbana-Champaign",
          state: "Illinois",
          country: "USA",
        },
        ranking: 35,
        website: "https://www.illinois.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/illinois.jpg",
      },
      {
        name: "University of Wisconsin-Madison",
        location: {
          city: "Madison",
          state: "Wisconsin",
          country: "USA",
        },
        ranking: 38,
        website: "https://www.wisc.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/wisc.jpg",
      },
      {
        name: "University of Texas at Austin",
        location: {
          city: "Austin",
          state: "Texas",
          country: "USA",
        },
        ranking: 43,
        website: "https://www.utexas.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/utexas.jpg",
      },
      {
        name: "New York University",
        location: {
          city: "New York",
          state: "New York",
          country: "USA",
        },
        ranking: 46,
        website: "https://www.nyu.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/nyu.jpg",
      },
      {
        name: "Boston University",
        location: {
          city: "Boston",
          state: "Massachusetts",
          country: "USA",
        },
        ranking: 57,
        website: "https://www.bu.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/bu.jpg",
      },
      {
        name: "Northeastern University",
        location: {
          city: "Boston",
          state: "Massachusetts",
          country: "USA",
        },
        ranking: 62,
        website: "https://www.northeastern.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/northeastern.jpg",
      },
      {
        name: "University of Southern California",
        location: {
          city: "Los Angeles",
          state: "California",
          country: "USA",
        },
        ranking: 65,
        website: "https://www.usc.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/usc.jpg",
      },
      {
        name: "Purdue University",
        location: {
          city: "West Lafayette",
          state: "Indiana",
          country: "USA",
        },
        ranking: 70,
        website: "https://www.purdue.edu",
        imageUrl: "https://storage.googleapis.com/gradaid-images/purdue.jpg",
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
      },
      {
        universityId: universityIds["Harvard University"],
        name: "Computer Science",
        degree: "MS",
        department: "School of Engineering and Applied Sciences",
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
        website: "https://www.seas.harvard.edu/computer-science/graduate-programs",
      },
      {
        universityId: universityIds["Harvard University"],
        name: "Data Science",
        degree: "MS",
        department: "School of Engineering and Applied Sciences",
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
        website: "https://www.seas.harvard.edu/applied-computation/graduate-programs",
      },
      {
        universityId: universityIds["Princeton University"],
        name: "Computer Science",
        degree: "PhD",
        department: "School of Engineering and Applied Science",
        requirements: {
          minimumGPA: 3.8,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 1",
          spring: undefined,
        },
        website: "https://www.cs.princeton.edu/graduate",
      },
      {
        universityId: universityIds["California Institute of Technology"],
        name: "Computing and Mathematical Sciences",
        degree: "PhD",
        department: "Division of Engineering and Applied Science",
        requirements: {
          minimumGPA: 3.8,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 1",
          spring: undefined,
        },
        website: "https://cms.caltech.edu/academics/graduate",
      },
      {
        universityId: universityIds["University of Chicago"],
        name: "Computer Science",
        degree: "MS",
        department: "Department of Computer Science",
        requirements: {
          minimumGPA: 3.5,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "January 7",
          spring: undefined,
        },
        website: "https://cs.uchicago.edu/graduate/masters-program/",
      },
      {
        universityId: universityIds["University of Pennsylvania"],
        name: "Computer and Information Science",
        degree: "MS",
        department: "School of Engineering and Applied Science",
        requirements: {
          minimumGPA: 3.5,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 15",
          spring: undefined,
        },
        website: "https://www.cis.upenn.edu/graduate/program-offerings/",
      },
      {
        universityId: universityIds["Yale University"],
        name: "Computer Science",
        degree: "MS",
        department: "School of Engineering & Applied Science",
        requirements: {
          minimumGPA: 3.6,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 15",
          spring: undefined,
        },
        website: "https://cpsc.yale.edu/academics/graduate-program",
      },
      {
        universityId: universityIds["Columbia University"],
        name: "Computer Science",
        degree: "MS",
        department: "Fu Foundation School of Engineering and Applied Science",
        requirements: {
          minimumGPA: 3.5,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "February 15",
          spring: "October 1",
        },
        website: "https://www.cs.columbia.edu/education/ms/",
      },
      {
        universityId: universityIds["Cornell University"],
        name: "Computer Science",
        degree: "MS",
        department: "Computing and Information Science",
        requirements: {
          minimumGPA: 3.5,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "January 15",
          spring: undefined,
        },
        website: "https://www.cs.cornell.edu/masters",
      },
      {
        universityId: universityIds["University of Michigan"],
        name: "Computer Science and Engineering",
        degree: "MS",
        department: "College of Engineering",
        requirements: {
          minimumGPA: 3.5,
          gre: false,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "January 15",
          spring: undefined,
        },
        website: "https://cse.engin.umich.edu/academics/graduate/masters-programs/",
      },
      {
        universityId: universityIds["Northwestern University"],
        name: "Computer Science",
        degree: "MS",
        department: "McCormick School of Engineering",
        requirements: {
          minimumGPA: 3.5,
          gre: false,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 15",
          spring: undefined,
        },
        website: "https://www.mccormick.northwestern.edu/computer-science/academics/graduate/",
      },
      {
        universityId: universityIds["University of California, Los Angeles"],
        name: "Computer Science",
        degree: "MS",
        department: "Henry Samueli School of Engineering and Applied Science",
        requirements: {
          minimumGPA: 3.5,
          gre: false,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 1",
          spring: undefined,
        },
        website: "https://www.cs.ucla.edu/graduate-program/",
      },
      {
        universityId: universityIds["University of Washington"],
        name: "Computer Science & Engineering",
        degree: "MS",
        department: "Paul G. Allen School of Computer Science & Engineering",
        requirements: {
          minimumGPA: 3.5,
          gre: false,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 15",
          spring: undefined,
        },
        website: "https://www.cs.washington.edu/academics/grad",
      },
      {
        universityId: universityIds["University of Illinois at Urbana-Champaign"],
        name: "Computer Science",
        degree: "MS",
        department: "Grainger College of Engineering",
        requirements: {
          minimumGPA: 3.2,
          gre: false,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 15",
          spring: "September 15",
        },
        website: "https://cs.illinois.edu/academics/graduate/professional-mcs",
      },
      {
        universityId: universityIds["University of Wisconsin-Madison"],
        name: "Computer Sciences",
        degree: "MS",
        department: "College of Letters & Science",
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
        website: "https://www.cs.wisc.edu/graduate/ms-program/",
      },
      {
        universityId: universityIds["University of Texas at Austin"],
        name: "Computer Science",
        degree: "MS",
        department: "College of Natural Sciences",
        requirements: {
          minimumGPA: 3.0,
          gre: false,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 1",
          spring: undefined,
        },
        website: "https://www.cs.utexas.edu/graduate/prospective-students/ms-program",
      },
      {
        universityId: universityIds["New York University"],
        name: "Computer Science",
        degree: "MS",
        department: "Courant Institute of Mathematical Sciences",
        requirements: {
          minimumGPA: 3.5,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 1",
          spring: "October 1",
        },
        website: "https://cs.nyu.edu/home/master/",
      },
      {
        universityId: universityIds["Boston University"],
        name: "Computer Science",
        degree: "MS",
        department: "College of Arts & Sciences",
        requirements: {
          minimumGPA: 3.0,
          gre: false,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "January 15",
          spring: "September 15",
        },
        website: "https://www.bu.edu/cs/masters/",
      },
      {
        universityId: universityIds["Northeastern University"],
        name: "Computer Science",
        degree: "MS",
        department: "Khoury College of Computer Sciences",
        requirements: {
          minimumGPA: 3.0,
          gre: false,
          toefl: true,
          recommendationLetters: 2,
        },
        deadlines: {
          fall: "February 1",
          spring: "September 15",
        },
        website: "https://www.khoury.northeastern.edu/programs/computer-science-ms/",
      },
      {
        universityId: universityIds["University of Southern California"],
        name: "Computer Science",
        degree: "MS",
        department: "Viterbi School of Engineering",
        requirements: {
          minimumGPA: 3.0,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 15",
          spring: "September 15",
        },
        website: "https://www.cs.usc.edu/academic-programs/masters/",
      },
      {
        universityId: universityIds["Purdue University"],
        name: "Computer Science",
        degree: "MS",
        department: "College of Science",
        requirements: {
          minimumGPA: 3.0,
          gre: false,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "January 15",
          spring: "August 1",
        },
        website: "https://www.cs.purdue.edu/graduate/",
      },
      // Adding programs with different specializations
      {
        universityId: universityIds["Massachusetts Institute of Technology"],
        name: "Artificial Intelligence",
        degree: "MS",
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
        universityId: universityIds["Stanford University"],
        name: "Artificial Intelligence",
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
        website: "https://ai.stanford.edu/academics/",
      },
      {
        universityId: universityIds["Carnegie Mellon University"],
        name: "Machine Learning",
        degree: "MS",
        department: "School of Computer Science",
        requirements: {
          minimumGPA: 3.7,
          gre: true,
          toefl: true,
          recommendationLetters: 3,
        },
        deadlines: {
          fall: "December 10",
          spring: undefined,
        },
        website: "https://www.ml.cmu.edu/academics/",
      }
    ];

    // Insert programs and store their IDs
    const programIds: Record<string, Id<"programs">> = {};
    for (const program of programData) {
      const id = await ctx.db.insert("programs", program);
      // Store program ID using composite key of university name and program name
      const university = await ctx.db.get(program.universityId);
      if (university) {
        programIds[`${university.name}-${program.degree}-${program.name}`] = id;
      }
    }
  }
});