import { supabase } from '../supabaseClient';
import University from '../models/University';

class UniversityService {
  /**
   * Fetches all universities from the database.
   * @returns {Promise<Array<University>>} A promise that resolves to an array of universities.
   */
  async getAllUniversities() {
    try {
      let { data, error } = await supabase
        .from('University')
        .select('*');

      if (error) {
        throw error;
      }

      return data.map(universityData => new University(universityData));
    } catch (error) {
      console.error('Failed to fetch universities:', error);
      throw error;
    }
  }

  /**
   * Fetches a university by its ID.
   * @param {number} university_id - The ID of the university to fetch.
   * @returns {Promise<University>} A promise that resolves to the university data.
   */
  async getUniversityById(university_id) {
    try {
      let { data, error } = await supabase
        .from('University')
        .select('*')
        .eq('university_id', university_id)
        .single();

      if (error) {
        throw error;
      }

      return new University(data);
    } catch (error) {
      console.error(`Failed to fetch university with id ${university_id}:`, error);
      throw error;
    }
  }

  /**
   * Adds a new university to the database.
   * @param {University} university - The university object to add.
   * @returns {Promise<Object>} A promise that resolves to the added university data.
   * @throws {Error} If a university with the same name already exists or if the insertion fails.
   */
  async addUniversity(university) {
    if (!(university instanceof University)) {
      throw new Error('Input must be an instance of University');
    }

    try {
      // Check if university with the same name already exists
      let { data: existingUniversity, error: checkError } = await supabase
        .from('University')
        .select('university_name')
        .eq('university_name', university.university_name)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116: No rows found
        throw checkError;
      }

      if (existingUniversity) {
        throw new Error(`University with name ${university.university_name} already exists.`);
      }

      // Insert new university
      const { data, error } = await supabase
        .from('University')
        .insert([university]);

      if (error) {
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Failed to add university:', error);
      throw error;
    }
  }

  /**
   * Updates an existing university in the database.
   * @param {University} university - The university object with updated data.
   * @returns {Promise<University>} A promise that resolves to the updated university data.
   */
  async updateUniversity(university) {
    if (!(university instanceof University)) {
      throw new Error('Input must be an instance of University');
    }

    try {
      const { data, error } = await supabase
        .from('University')
        .update({
          university_name: university.university_name,
          location: university.location,
          website: university.website,
          university_description: university.university_description
        })
        .eq('university_id', university.university_id);

      if (error) {
        throw error;
      }

      return new University(data[0]);
    } catch (error) {
      console.error(`Failed to update university with id ${university.university_id}:`, error);
      throw error;
    }
  }
}

const universityService = new UniversityService();
export default universityService;
