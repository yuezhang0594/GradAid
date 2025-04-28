import { internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { WithoutSystemFields } from "convex/server";
import universities from "./data/universities.json";
import programs from "./data/programs.json";

type University = Doc<"universities">;
type UniversityInput = WithoutSystemFields<University>;

type Program = Doc<"programs">;
type ProgramInput = WithoutSystemFields<Program>;

const skipDegrees = [
  [
    "M.E.M.",
    "M.M.Sc.",
    "Sc.M.",
    "M.B.E.",
    "M.C.M.",
    "M.F.A.S.",
    "M.F.R.C.",
    "M.D.P.",
    "M.B.S.",
    "D.B.A.",
    "M.A.Ed.",
    "M.I.T.",
    "M.N.R.",
    "M.P.I.A.",
    "M.U.R.P.L.",
    "M.M.Ed.",
    "M.P.L.",
    "M.S.O.T.",
    "M.A.D.U.",
    "M.S.I.M.",
    "M.S.A.E.",
    "M.S.C.E.",
    "M.S.E.S.",
    "M.S.E.E.",
    "M.S.M.E.",
    "M.A.E.L.",
    "M.G.A.",
    "M.S.M.",
    "M.H.R.I.R.",
    "M.A.N.S.C.",
    "V.M.D.",
    "M.U.P.P.",
    "M.C.P.",
    "M.D.S.",
    "M.I.M.S.",
    "M.DevEng.",
    "M.J.",
    "M.U.D.",
    "J.D./Ph.D.",
    "M.L.A.S.",
    "D.Des.",
    "M.A",
    "MRED",
    "MCRP",
    "M.P.Ac.",
    "M.H.C.I.D.",
    "M.Q.E.",
    "M.Engr.",
    "M.F.E.",
    "M.A.G.I.S.T.",
    "M.Q.S.T.",
    "M.S.S.",
    "M.A.S.D.S.",
    "Dr.P.H.",
    "M.A.A.D.",
    "M.S.A.S.",
    "M.S.C.R.P.",
    "M.S.H.P.",
    "M.S.L.A.",
    "M.S.S.D.",
    "M.Music",
    "M.S.I.S.",
    "M.P.Aff.",
    "M.G.P.S.",
    "M.S.S.W.",
    "M.S.D.",
    "Pharm.D.",
    "M.Fin.",
    "M.Acc.",
    "M.T.M.",
    "M.E.D.S.",
    "M.E.S.M.",
    "M.U.P.",
    "M.S.J.",
    "M.A.R.",
    "J.S.D.",
    "M.S.L.",
    "M.H.P.",
    "M.P.V.M.",
    "M.L.S.",
    "M.N.A.",
    "M.Des.",
    "M.S.U.D.",
    "M.L.I.S.",
    "M.I.D.",
    "M.C.S.",
    "D.P.T.",
    "M.E.",
    "M.S.T.",
    "M.U.R.P.",
    "D.M.D.",
    "M.E.T.",
    "M.A.S.",
    "Ed.M.",
    "D.N.P.",
    "M.H.S.",
    "Au.D.",
    "M.H.A.",
    "M.T.S.",
    "M.L.A.",
    "M.Ag.",
    "Ed.S.",
  ],
];

export default internalMutation({
  args: {},
  handler: async (ctx, args) => {
    const tablesToClear = ["universities", "programs"] as const;

    for (const table of tablesToClear) {
      await ctx.db
        .query(table)
        .collect()
        .then((existingData) => {
          return Promise.all(
            existingData.map((item) => ctx.db.delete(item._id))
          );
        });
    }

    const universityMap = new Map<string, Id<"universities">>();

    await Promise.all(
      universities.map(async (university: UniversityInput) => {
        const universityId = await ctx.db.insert("universities", university);
        universityMap.set(university.name, universityId);
      })
    );

    await Promise.all(
      programs.map(async (program: ProgramInput) => {
        const universityId = universityMap.get(program.universityId);
        if (!universityId) {
          throw new Error(`University not found for program: ${program.name}`);
        }

        if (
          skipDegrees.some((degreeList) =>
            degreeList.includes(program.degree)
          )
        ) {
          return;
        }

        if (!program.requirements.minimumGPA) {
          program.requirements.minimumGPA = 2.5;
        }

        const programWithUniversity: ProgramInput = {
          ...program,
          universityId: universityId,
        };

        await ctx.db.insert("programs", programWithUniversity);
      })
    );
  },
});
