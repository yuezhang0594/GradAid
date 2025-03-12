import { internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Define types based on our schema
type University = Doc<"universities">
type UniversityInput = Omit<University, "_id" | "_creationTime">

type Program = Doc<"programs">
type ProgramInput = Omit<Program, "_id" | "_creationTime">

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

    // Clear existing universities and programs from the database first
    await ctx.db
      .query("universities")
      .collect()
      .then(existingUniversities => {
        return Promise.all(
          existingUniversities.map(university =>
            ctx.db.delete(university._id)
          )
        );
      });

    await ctx.db
      .query("programs")
      .collect()
      .then(existingPrograms => {
        return Promise.all(
          existingPrograms.map(program =>
            ctx.db.delete(program._id)
          )
        );
      });

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
        name: "University of California, Berkeley",
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
        universityId: universityIds["University of California, Berkeley"],
        name: "Computer Science",
        degree: "MS",
        department: "College of Engineering",
        requirements: {
          minimumGPA: 3.0,
          gre: true,
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
          toefl: true,
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
          gre: true,
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
          gre: true,
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

    return {
      status: "initialized",
      universitiesCount: universityData.length,
      programsCount: programData.length
    };
  },
});
