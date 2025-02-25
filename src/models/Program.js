class Program {
  constructor({ program_id, university_id, program_name, degree_type, deadline, description, website, field_of_study, application_fee, avg_gpa_admit, avg_gre_admit }) {
    if (!university_id || !program_name || !degree_type || !deadline) {
      throw new Error('Missing required properties: university_id, program_name, degree_type, deadline');
    }
    this._program_id = program_id;
    this._university_id = university_id;
    this._program_name = program_name;
    this._degree_type = degree_type;
    this._deadline = deadline;
    this._description = description;
    this._website = website;
    this._field_of_study = field_of_study;
    this._application_fee = application_fee;
    this._avg_gpa_admit = avg_gpa_admit;
    this._avg_gre_admit = avg_gre_admit;
  }

  get program_id() {
    return this._program_id;
  }

  get university_id() {
    return this._university_id;
  }

  set university_id(value) {
    if (!value) {
      throw new Error('university_id is required');
    }
    this._university_id = value;
  }

  get program_name() {
    return this._program_name;
  }

  set program_name(value) {
    if (!value) {
      throw new Error('program_name is required');
    }
    this._program_name = value;
  }

  get degree_type() {
    return this._degree_type;
  }

  set degree_type(value) {
    if (!value) {
      throw new Error('degree_type is required');
    }
    this._degree_type = value;
  }

  get deadline() {
    return this._deadline;
  }

  set deadline(value) {
    if (!value) {
      throw new Error('deadline is required');
    }
    this._deadline = value;
  }

  get description() {
    return this._description;
  }

  set description(value) {
    this._description = value;
  }

  get website() {
    return this._website;
  }

  set website(value) {
    this._website = value;
  }

  get field_of_study() {
    return this._field_of_study;
  }

  set field_of_study(value) {
    this._field_of_study = value;
  }

  get application_fee() {
    return this._application_fee;
  }

  set application_fee(value) {
    this._application_fee = value;
  }

  get avg_gpa_admit() {
    return this._avg_gpa_admit;
  }

  set avg_gpa_admit(value) {
    this._avg_gpa_admit = value;
  }

  get avg_gre_admit() {
    return this._avg_gre_admit;
  }

  set avg_gre_admit(value) {
    this._avg_gre_admit = value;
  }
}

export default Program;
