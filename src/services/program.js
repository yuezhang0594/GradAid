import { supabase } from '../supabaseClient';
import Program from '../models/Program';

class ProgramService {
  /**
   * Adds a new program to the database.
   * 
   * @param {Program} program - The program object to add.
   * @returns {Promise<Object>} The added program data.
   * @throws {Error} If the insertion fails.
   */
  async addProgram(program) {
    if (!(program instanceof Program)) {
      throw new Error('Input must be an instance of Program');
    }
    console.log('Adding program:', program);
    const { data, error } = await supabase
      .from('Program')
      .insert([program]);

    if (error) {
      throw new Error('Failed to add program: ' + error.message);
    }

    return data[0];
  }

  /**
   * Retrieves all programs from the database.
   * 
   * @returns {Promise<Array<Program>>} The list of programs.
   * @throws {Error} If the retrieval fails.
   */
  async getAllPrograms() {
    const { data, error } = await supabase
      .from('Program')
      .select('*');

    if (error) {
      throw new Error('Failed to retrieve programs: ' + error.message);
    }

    return data.map(programData => new Program(programData));
  }

  /**
   * Retrieves a program by its ID.
   * 
   * @param {bigint} id - The ID of the program.
   * @returns {Promise<Program>} The program data.
   * @throws {Error} If the retrieval fails or the program is not found.
   */
  async getProgramByID(id) {
    const { data, error } = await supabase
      .from('Program')
      .select('*')
      .eq('program_id', id)
      .single();

    if (error) {
      throw new Error('Failed to retrieve program: ' + error.message);
    }

    return new Program(data);
  }

  /**
   * Updates an existing program in the database.
   * 
   * @param {Program} program - The program object with updated data.
   * @returns {Promise<Program>} The updated program data.
   * @throws {Error} If the update fails.
   */
  async updateProgram(program) {
    if (!(program instanceof Program)) {
      throw new Error('Input must be an instance of Program');
    }

    const { data, error } = await supabase
      .from('Program')
      .update({
        university_id: program.university_id,
        program_name: program.program_name,
        degree_type: program.degree_type,
        deadline: program.deadline,
        description: program.description,
        website: program.website,
        field_of_study: program.field_of_study,
        application_fee: program.application_fee,
        avg_gpa_admit: program.avg_gpa_admit,
        avg_gre_admit: program.avg_gre_admit
      })
      .eq('program_id', program.program_id);

    if (error) {
      throw new Error('Failed to update program: ' + error.message);
    }

    return new Program(data[0]);
  }
}

const programService = new ProgramService();
export default programService;